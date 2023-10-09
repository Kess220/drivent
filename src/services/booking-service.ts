/* eslint-disable prettier/prettier */
import { TicketStatus } from '@prisma/client';
import { bookingRepository } from '@/repositories/booking-repository';
import { notFoundBookingError, forbiddenError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';

async function createBooking(userId: number, roomId: number) {
  // Verifique se o quarto está totalmente ocupado
  const { room, reservationCount } = await bookingRepository.isRoomFull(roomId);
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundBookingError('a');

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundBookingError('a');

  const type = ticket.TicketType;

  if (!room) {
    throw notFoundBookingError('Room does not exist!');
  }
  if (!type.includesHotel) {
    throw forbiddenError('Ticket does not include Hotel');
  }
  if (type.isRemote) {
    throw forbiddenError('Ticket is remote');
  }

  if (ticket.status === TicketStatus.RESERVED) {
    throw forbiddenError('Ticket is not PAID');
  }

  if (reservationCount >= room.capacity) {
    throw forbiddenError('Quarto está totalmente ocupado');
  }

  // Chame a função do repositório para criar a reserva
  const bookingId = await bookingRepository.createBookingRepository(userId, roomId);
  if (!bookingId) {
    throw notFoundBookingError('bookingId does not exist');
  }

  return { bookingId };
}

async function getBookingByUser(userId: number) {
  const booking = await bookingRepository.getBookingByUserRepository(userId);

  if (!booking) {
    throw notFoundBookingError('User has no booking.');
  }

  return booking;
}

async function putBookingByUserId(userId: number, roomId: number, bookingId: number) {
  const { room, reservationCount } = await bookingRepository.isRoomFull(roomId);

  if (!room) {
    throw notFoundBookingError('Room not exist');
  }

  if (reservationCount >= room.capacity) {
    throw forbiddenError('Room is already full');
  }

  // Verifique se o usuário possui uma reserva para o quarto
  const existingBooking = await bookingRepository.getBookingByUserRepository(userId);

  if (!existingBooking) {
    throw forbiddenError('User does not have a booking for this room');
  }
  const { id } = await bookingRepository.putBookingByUserIdRepository(bookingId, roomId);

  return { bookingId: id };
}

export const bookingService = {
  createBooking,
  getBookingByUser,
  putBookingByUserId,
};
