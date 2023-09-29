/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { listHotels } from '../controllers/hotel-controller';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.get('/', authenticateToken, listHotels);

export { hotelsRouter };
