/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBookingController, getBookingByUserController, putBookingByUserIdController } from '@/controllers';

const bookingRouter = Router();

bookingRouter.post('/', authenticateToken, createBookingController);
bookingRouter.get('/', authenticateToken, getBookingByUserController);
bookingRouter.put('/:bookingId', authenticateToken, putBookingByUserIdController);

export { bookingRouter };
