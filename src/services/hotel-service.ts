/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import {
  getHotelsRepository,
  enrollmentGetId,
  getTicketID,
  getHotelRoomRepository,
} from '../repositories/hotels-repository';

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

  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status === 'RESERVED') {
    return httpStatus.PAYMENT_REQUIRED;
  }

  if (!hotels || hotels.length === 0) {
    return httpStatus.NOT_FOUND;
  }

  return hotels;
}

async function getHotelWithRoomsById(userId: number, hotelId: number) {
  // // Verifique se o hotel existe usando a função do repositório
  // await getHotels(userId);

  const hotel = await getHotelRoomRepository(hotelId);

  // Verifique se o hotel existe e pertence ao usuário (se necessário)
  if (!hotel) {
    return httpStatus.NOT_FOUND;
  }

  const enrollment = await enrollmentGetId(userId);

  if (!enrollment) {
    return httpStatus.NOT_FOUND;
  }

  const ticket = await getTicketID(enrollment.id);

  if (!ticket) {
    return httpStatus.NOT_FOUND;
  }

  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status === 'RESERVED') {
    return httpStatus.PAYMENT_REQUIRED;
  }

  return hotel;
}

export { getHotels, getHotelWithRoomsById };
