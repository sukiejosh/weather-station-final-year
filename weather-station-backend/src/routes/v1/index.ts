import express, { Router } from 'express';
import { Namespace } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import config from '../../config/config';
import initAuthRouter from './auth.route';
import initStationRouter from './stations.route';
import docsRoute from './swagger.route';
import initUserRouter from './user.route';
import initWeatherDataRouter from './weatherData.route';



const initRouter = (io: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  const router = express.Router();
  const authRoute = initAuthRouter(io);
  const userRoute = initUserRouter(io);
  const stationRoute = initStationRouter(io);
  const weatherData = initWeatherDataRouter(io);
  const defaultIRoute: IRoute[] = [
    {
      path: '/auth',
      route: authRoute,
    },
    {
      path: '/users',
      route: userRoute,
    },
    {
      path: '/stations',
      route: stationRoute,
    },
    {
      path: '/weather',
      route: weatherData,
    },
  ];

  const devIRoute: IRoute[] = [
    // IRoute available only in development mode
    {
      path: '/docs',
      route: docsRoute,
    },
  ];

  defaultIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });

  /* istanbul ignore next */
  if (config.env === 'development') {
    devIRoute.forEach((route) => {
      router.use(route.path, route.route);
    });
  }
  return router
}


interface IRoute {
  path: string;
  route: Router;
}





export default initRouter;
