/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBookingController, getBookingByUserController } from '@/controllers';

const bookingRouter = Router();

bookingRouter.post('/', authenticateToken, createBookingController);
bookingRouter.get('/', authenticateToken, getBookingByUserController);

export { bookingRouter };
