import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import { roleRights } from '../../config/roles';
import ApiError from '../errors/ApiError';
import { IUserDoc } from '../user/user.interfaces';

const verifyCallback =
  (req: Request, resolve: any, reject: any, requiredRights: string[]) =>
    async (err: Error, user: IUserDoc, info: string) => {
      if (err || info || !user) {
        console.log('err', err)
        console.log('info', info)
        console.log('no user', user)
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      }
      req.user = user;

      if (requiredRights.length) {
        const userRights = roleRights.get(user.role);
        if (!userRights) return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        const hasRequiredRights = requiredRights.every((requiredRight: string) => userRights.includes(requiredRight));
        if (!hasRequiredRights && req.params['userId'] !== user.id) {
          return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        }
      }

      resolve();
    };

const authMiddleware =
  (...requiredRights: string[]) =>
    async (req: Request, res: Response, next: NextFunction) =>

      new Promise<void>((resolve, reject) => {
        console.log('req is', req.headers)
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
      })
        .then(() => {
          // socket.dat/a.user = req.user;
          next()
        })
        .catch((err) => {
          console.log('erorr auth', err)
          next(new Error(err))
        });

export const liveWeatherMiddleware =
  async (req: Request, _: any, next: NextFunction,) => {
    console.log('req is', req)
    let userData = undefined
    passport.authenticate('jwt', { session: false }, async (err, user) => {
      if (!err) {
        console.log('user is', user)
        userData = user;
        next()
      }
    })(req, _, next);
    console.log('user data is', userData)
    return userData
  }


export default authMiddleware;
