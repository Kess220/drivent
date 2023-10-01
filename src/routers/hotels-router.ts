/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { listHotels, getHotelsById } from '../controllers/hotel-controller';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.get('/', authenticateToken, listHotels).get('/:hotelId', authenticateToken, getHotelsById);

export { hotelsRouter };
