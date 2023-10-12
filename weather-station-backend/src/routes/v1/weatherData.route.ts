import express, { Router } from 'express';
import { Namespace } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { stationController } from '../../modules/stations';

const initWeatherDataRouter = (io: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  // console.log('io is', io)
  const router: Router = express.Router();
  router.route('/:stationId')
    .post(stationController.saveWeatherData(io))
    .get(stationController.getWeatherData);
  router.route('/:stationId/live')
  return router;
}
export default initWeatherDataRouter;
