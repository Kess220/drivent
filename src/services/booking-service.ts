/* eslint-disable prettier/prettier */
import { TicketStatus } from '@prisma/client';
import { bookingRepository } from '@/repositories/booking-repository';
import { notFoundBookingError, forbiddenError, cannotListHotelsError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';

export async function createBooking(userId: number, roomId: number) {
  // Verifique se o quarto está totalmente ocupado
  const { room, reservationCount } = await bookingRepository.isRoomFull(roomId);
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundBookingError('a');

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundBookingError('a');

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
    throw cannotListHotelsError();
  }

  // Verifique se o quarto existe
  if (!room) {
    throw notFoundBookingError('Room not exist!');
  }

  if (reservationCount >= room.capacity) {
    throw forbiddenError('Quarto está totalmente ocupado');
  }

  // Chame a função do repositório para criar a reserva
  const bookingId = await bookingRepository.createBookingRepository(userId, roomId);

  if (!bookingId) {
    throw notFoundBookingError('bookingId is not exist');
  }

  return { bookingId };
}

export const bookingService = {
  createBooking,
};
