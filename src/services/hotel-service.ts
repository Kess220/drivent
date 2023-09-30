/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import { getHotelsRepository, enrollmentGetId, getTicketID } from '../repositories/hotels-repository';

async function getHotels(userId: number) {
  const hotels = await getHotelsRepository();

  const enrollment = await enrollmentGetId(userId);

  if (!enrollment) {
    return httpStatus.NOT_FOUND;
  }

  const ticket = await getTicketID(enrollment.id);

  if (!ticket) {
    return httpStatus.NOT_FOUND;
  }

  if (ticket.status === 'RESERVED') {
    return httpStatus.PAYMENT_REQUIRED;
  }

  if (ticket.TicketType.isRemote) {
    return httpStatus.PAYMENT_REQUIRED;
  }

  if (ticket.TicketType.includesHotel) {
    return httpStatus.PAYMENT_REQUIRED;
  }

  if (!hotels || hotels.length === 0) {
    return httpStatus.NOT_FOUND;
  }
  return hotels;
}

export { getHotels };
