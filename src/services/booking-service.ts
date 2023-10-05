/* eslint-disable prettier/prettier */
import bookingRepository from '@/repositories/booking-repository';

import { notFoundBookingError, forbiddenError } from '@/errors';

export async function createBooking(userId: number, roomId: number) {
  // Verifique se o quarto está totalmente ocupado
  const { room, reservationCount } = await bookingRepository.isRoomFull(roomId);

  if (!room || !room.id) {
    throw notFoundBookingError('Room not exist!');
  }

  if (reservationCount >= room.capacity) {
    throw forbiddenError('Quarto está totalmente ocupado');
  }

  // Chame a função do repositório para criar a reserva
  const bookingId = await bookingRepository.createBookingRepository(userId, roomId);

  if (!bookingId) {
    throw notFoundBookingError('Booking not found!');
  }

  return { bookingId };
}

export const bookingService = {
  createBooking,
};
