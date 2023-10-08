/* eslint-disable prettier/prettier */
import { Response } from 'express';
import httpStatus from 'http-status';
import { bookingService } from './../services/booking-service';
import { AuthenticatedRequest } from '@/middlewares';
import { InputBookingBody } from '@/protocols';

export async function createBookingController(req: AuthenticatedRequest, res: Response) {
  const roomId = parseInt(req.body.roomId, 10); // Converte para número usando parseInt
  const userId = req.userId;

  // Chame o serviço para criar a reserva
  const { bookingId } = await bookingService.createBooking(userId, roomId);

  // Retorne a resposta com o ID da reserva criada
  res.status(httpStatus.OK).json({ bookingId });
}

export async function getBookingByUserController(req: AuthenticatedRequest, res: Response) {
  const bookingController = await bookingService.getBookingByUser(req.userId);

  res.status(httpStatus.OK).send(bookingController);
}

export async function putBookingByUserIdController(req: AuthenticatedRequest, res: Response) {
  const body = req.body as InputBookingBody;
  console.log(body);

  const bookingId = parseInt(req.params.bookingId) as number;
  const booking = await bookingService.putBookingByUserId(req.userId, body.roomId, bookingId);
  res.status(httpStatus.OK).send(booking);
}
