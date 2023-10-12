import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Namespace } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ApiError } from '../errors';
import { IOptions } from '../paginate/paginate';
import { verifyAToken } from '../token/token.service';
import { IUserDoc } from '../user/user.interfaces';
import { catchAsync, pick } from '../utils';
import * as stationService from './station.service';

export const registerStation = catchAsync(async (req: Request, res: Response) => {
  console.log('user is', req.user)
  const station = await stationService.registerStation(req.body, req.user as IUserDoc);
  res.status(httpStatus.CREATED).send(station);
});

export const getRegToken = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }
  const token = await stationService.generateStationToken(userId);
  res.status(httpStatus.CREATED).send(token);
});

export const saveWeatherData = (io: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => catchAsync(async (req: Request, res: Response) => {
  const stationId = req.params['stationId'];
  const token = req.query['token'];
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token is required');
  }

  const isValidToken = await verifyAToken(token as string, stationId as string, 'saveWeather');

  if (!isValidToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token');
  }

  let s;
  if (typeof stationId === 'string') {
    s = await stationService.getStationById(new mongoose.Types.ObjectId(stationId));
    if (!s) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Station not found');
    }
  }
  let room = `station-${stationId}`;
  const station = await stationService.saveWeatherData(s?.id, req.body as IUserDoc);
  io.to(room).emit('weather_data', station);
  res.status(httpStatus.CREATED).send(station);
});

export const getStations = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const { lang, lat } = req.body;

  if ((lang && !lat) || (!lang && lat)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Both lang and lat are required');
  }

  // @ts-ignore
  const filter = { ...pick(req.query, ['name', 'identifier', 'lang', 'lat']), owner: userId };
  const options: IOptions = { ...pick(req.query, ['sort', 'limit', 'page', 'projection']), lean: true }
  const stations = await stationService.queryStations(filter, options);
  res.send(stations);
});

export const getWeatherData = catchAsync(async (req: Request, res: Response) => {
  const stationId = req.params['stationId'];
  // @ts-ignore
  const owner = req.user?.id;
  let s;
  if (typeof stationId === 'string') {
    s = await stationService.getStationById(new mongoose.Types.ObjectId(stationId));   
    if (!s) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Station not found');
    }
  }
  const filter = { station: s?.id, owner };
  //@ts-ignore
  const options: IOptions = { ...pick(req.query, ['sort', 'limit', 'page', 'projection']), lean: true, sort: { createdAt: -1 }, pagination: req?.query?.all && req?.query?.all == true }
  console.log('oprions', options)
  const weatherData = await stationService.getWeatherData(filter, options);
  res.status(httpStatus.CREATED).send(weatherData);
});

export const getStation = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['stationId'] === 'string') {
    const station = await stationService.getStationById(new mongoose.Types.ObjectId(req.params['stationId']));
    if (!station) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Station not found');
    }
    res.send(station);
  }
});

export const updateStation = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['stationId'] === 'string') {
    const station = await stationService.updateStationById(new mongoose.Types.ObjectId(req.params['stationId']), req.body);
    res.send(station);
  }
});

export const deleteStation = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['stationId'] === 'string') {
    await stationService.deleteStationById(new mongoose.Types.ObjectId(req.params['stationId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});
