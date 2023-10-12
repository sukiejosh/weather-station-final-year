import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ShortUniqueId from 'short-unique-id';
import { ApiError } from '../errors';
import { userService } from '../user';
import { IUserDoc } from '../user/user.interfaces';
import { IStationDoc, IWeatherDataDoc, NewRegisteredStation } from './station.interface';
import Station from './station.model';
import WeatherData from './weather.model';

export const generateStationToken = async (userID: string) => {
  // check if the user exists
  const user = await userService.getUserById(new mongoose.Types.ObjectId(userID));
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const uid = new ShortUniqueId({ length: 32 });
  const saveToken = userService.saveStationToken(user.id, uid());
  if (!saveToken) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save token');
  }
  return uid();
};

export const registerStation = async (stationBody: NewRegisteredStation, user: IUserDoc): Promise<IStationDoc> => {
  const userId = user.id;

  if (await Station.isNameTaken(stationBody.name, userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Station name already taken');
  }
  const userDetails = await userService.getUserById(new mongoose.Types.ObjectId(userId));

  if (!userDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const temp = await Station.create({ ...stationBody, owner: userId });
  const uid = new ShortUniqueId({ length: 32 });

  temp.identifier = uid();
  await temp.save();
  return temp;
};

export const getWeatherData = async (filter: Record<string, any>, options: Record<string, any>): Promise<any> => {
  const data = await WeatherData.paginate(filter, options);
  return data;
  // return data;
};

export const queryStations = async (filter: Record<string, any>, options: Record<string, any>): Promise<any> => {
  const stations = await Station.paginate(filter, options);
  return stations;
};

export const getStationById = async (id: mongoose.Types.ObjectId): Promise<IStationDoc | null> => Station.findById({ _id: id });

export const getStationByIdentifier = async (id: string): Promise<IStationDoc | null> => Station.findOne({ identifier: id });

export const saveWeatherData = async (
  stationId: mongoose.Types.ObjectId,
  weatherData: Record<string, any>
): Promise<IWeatherDataDoc> => {
  const station = await getStationById(stationId);
  if (!station) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Station not found');
  }
  const data = new WeatherData({ ...weatherData, station: station._id, stationName: station.name });
  await data.save();
  return data;
};

export const getStationByName = async (name: string): Promise<IStationDoc | null> => Station.findOne({ name });

export const updateStationById = async (
  stationId: mongoose.Types.ObjectId,
  updateBody: Record<string, any>
): Promise<IStationDoc> => {
  const station = await getStationById(stationId);
  if (!station) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Station not found');
  }
  if (updateBody['name'] && (await Station.isNameTaken(updateBody['name'], stationId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Station name already taken');
  }
  Object.assign(station, updateBody);
  await station.save();
  return station;
};

export const deleteStationById = async (stationId: mongoose.Types.ObjectId): Promise<IStationDoc | null> => {
  const station = await getStationById(stationId);
  if (!station) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Station not found');
  }
  await station.deleteOne();
  return station;
};
