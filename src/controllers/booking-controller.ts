/* eslint-disable prettier/prettier */
import { Response } from 'express';
import httpStatus from 'http-status';
import { bookingService } from './../services/booking-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function createBookingController(req: AuthenticatedRequest, res: Response) {
  const roomId = Number(req.body.roomId);
  const { userId } = req;

  // Chame o serviço para criar a reserva
  const { bookingId } = await bookingService.createBooking(userId, roomId);

  // Retorne a resposta com o ID da reserva criada
  res.status(httpStatus.OK).json({ bookingId });
}

export async function getBookingByUserController(req: AuthenticatedRequest, res: Response) {
  const bookingController = await bookingService.getBookingByUser(req.userId);

  res.status(httpStatus.OK).send({ bookingId: bookingController });
}
