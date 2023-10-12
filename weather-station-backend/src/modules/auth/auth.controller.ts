import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { emailService } from '../email';
import { ApiError } from '../errors';
import { getStationById } from '../stations/station.service';
import { tokenService, tokenTypes } from '../token';
import { userService } from '../user';
import { IUserDoc } from '../user/user.interfaces';
import catchAsync from '../utils/catchAsync';
import * as authService from './auth.service';

export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.registerUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const userWithTokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...userWithTokens });
});

export const generateStationToken = catchAsync(async (req: Request, res: Response) => {
  //@ts-ignore
  const userId = req.user?.id
  const days = req.body.days
  const type = req.body.type
  const stationId = req.body.stationId

  console.log('sss', stationId)

  const station = await getStationById(new mongoose.Types.ObjectId(stationId));
  if (!station) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Station not found');
  }

  let isTokenValid = false;
  for (const key in tokenTypes) {
    if (Object.prototype.hasOwnProperty.call(tokenTypes, key)) {
      //@ts-ignore
      const type = tokenTypes[key];
      if (type === req.body.type) {
        isTokenValid = true;
        break;
      }
    }
  }

  if (!isTokenValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token type');
  }

  const token = await authService.generateStationToken(userId, station.id, days, type);
  res.send({ token });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.query['token'], req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

export const sendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  const userD = req.user as IUserDoc;
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(userD);
  await emailService.sendVerificationEmail(userD.email, verifyEmailToken, userD.name);
  res.status(httpStatus.NO_CONTENT).send();
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.query['token']);
  res.status(httpStatus.NO_CONTENT).send();
});
