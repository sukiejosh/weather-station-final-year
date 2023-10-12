import express, { Router } from 'express';
import { Namespace } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { auth } from '../../modules/auth';
import { stationController } from '../../modules/stations';

const initStationRouter = (_: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  const router: Router = express.Router();

  router.route('/').post(auth(), stationController.registerStation).get(auth(), stationController.getStations);
  // router.get('/gettoken', auth(), stationController.getRegToken);
  router.post('/create', auth(), stationController.registerStation);
  router.route('/:stationId')
    .patch(stationController.updateStation)
    .get(stationController.getStation)

  return router;

}

export default initStationRouter;
