import mongoose, { Document, Model } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { AccessAndRefreshTokens } from '../token/token.interfaces';

export interface IStation {
  name: string;
  identifier: string;
  owner: mongoose.Types.ObjectId;

}

export interface IWeatherData {
  station?: mongoose.Types.ObjectId;
  stationName: string
  temp?: number;
  humidity?: number;
  pressure?: number;
  windspeed?: number;
  rainfall?: number;
  lang: number;
  lat: number;
  altitude: number;
}

export interface IStationDoc extends IStation, Document { }

export interface IWeatherDataDoc extends IWeatherData, Document { }

export interface IWeatherDataModel extends Model<IWeatherDataDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export interface IStationModel extends Model<IStationDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
  isNameTaken(name: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
}

export type UpdateStationBody = Partial<IStation>;

export type NewRegisteredStation = IStation;

export type NewCreatedStation = IStation;

export interface IStationWithTokens {
  station: IStationDoc;
  tokens: AccessAndRefreshTokens;
}
