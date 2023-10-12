import listEndpoints from 'express-list-endpoints';
import http from 'http';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import app from './app';
import config from './config/config';
import { auth } from './modules/auth';
import { ApiError, errorConverter, errorHandler } from './modules/errors';
import logger from './modules/logger/logger';
import { verifyAToken } from './modules/token/token.service';
import initRouter from './routes/v1';


let server: any;
mongoose.connect(config.mongoose.url).then(() => {
  logger.info('Connected to MongoDB');
  // server = app.listen(config.port, '0.0.0.0', () => {
  //   logger.info(`Listening to port ${config.port}`);
  // });
  const server = http.createServer(app);

  const socketIo = new Server(server, {
    cors: {
      origin: "*"
    }
  }).of('/live')

  socketIo.use(async (socket, next) => {
    const token = socket.handshake.auth['token'];
    const stationId: string = socket.handshake.query['stationId'] as string;
    const liveWeatherToken = socket.handshake.query['liveWeatherToken'] as string;
    console.log('Station id', stationId);
    console.log('Auth token', token);

    if (!stationId) {
      console.log('Station id is required');
      next(new Error('Station id is required'));
    }

    if (!token && !liveWeatherToken) {
      console.log('Token is required');
      next(new Error('Token is required'));
    }

    let verifyKey = undefined

    try {
      const req = {
        headers: {
          'authorization': `bearer ${token}`
        }
      } as any

      const res = {} as any

      if (liveWeatherToken) verifyKey = await verifyAToken(liveWeatherToken, stationId, 'liveWeather');
      console.log('Verify key', verifyKey);
      let authVerify = auth()
      // @ts-ignore
      await authVerify(req, res, next)
      if (!verifyKey && !req.user) {
        next(new Error('Invalid live weather token'));
      }


      socket.data.user = req.user;
    } catch (error) {
      console.log('Error socket.io', error);
      next(new Error(error as any));
      socket.disconnect(true);
    }

  });


  socketIo.on('connection', (socket) => {
    console.log('New connection created');
    const stationId: string = socket.handshake.query['stationId'] as string;
    const station = `station-${stationId}`;
    socket.data.station = station;
    socket.join(station);
  });

  const routes = initRouter(socketIo);
  // console.log('routes', routes)
  app.use(routes);


  // v1 api routes

  // send back a 404 error for any unknown api request
  app.use((_req, _res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
  });

  // convert error to ApiError, if needed
  app.use(errorConverter);

  // handle error
  app.use(errorHandler);


  console.log('Routes', listEndpoints(app));

  server.listen(config.port, '0.0.0.0', () => {
    logger.info(`Listening to port ${config.port}`);
  });

});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
