/* eslint-disable prettier/prettier */
import { createBookingRepository, isRoomFull } from '@/repositories/booking-repository';
import { notFoundBookingError, forbiddenError } from '@/errors';

export async function createBooking(userId: number, roomId: number) {
  // Verifique se o quarto está totalmente ocupado
  const { room, reservationCount } = await isRoomFull(roomId);

  if (!room) {
    throw notFoundBookingError();
  }

  if (reservationCount >= room.capacity) {
    throw forbiddenError('Quarto está totalmente ocupado');
  }

  // Chame a função do repositório para criar a reserva
  const bookingId = await createBookingRepository(userId, roomId);

  if (!bookingId) {
    throw notFoundBookingError();
  }

  return { bookingId };
}

export const bookingService = {
  createBooking,
};
