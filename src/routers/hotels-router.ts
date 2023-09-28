/* eslint-disable prettier/prettier */
import { Router } from 'express';

import { listHotels } from '../controllers/hotel-controller';

const hotelsRouter = Router();

hotelsRouter.get('/', listHotels);

export { hotelsRouter };
