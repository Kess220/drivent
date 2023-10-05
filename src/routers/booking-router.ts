/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBookingController } from '@/controllers';

const bookingRouter = Router();

bookingRouter.post('/', authenticateToken, createBookingController);

export { bookingRouter };
