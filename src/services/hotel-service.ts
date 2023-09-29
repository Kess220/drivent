/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import { getHotels as getHotelsRepository } from '../repositories/hotels-repository';
import { ticketsService } from './tickets-service';

async function getHotels(userId: number) {
  try {
    const hotels = await getHotelsRepository();
    const ticket = await ticketsService.getTicketByUserId(userId);

    if (!hotels || hotels.length === 0 || !ticket) {
      return httpStatus.NOT_FOUND;
    }

    if (ticket.TicketType.isRemote && !ticket.TicketType.includesHotel) {
      return httpStatus.PAYMENT_REQUIRED;
    }

    if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
      return httpStatus.PAYMENT_REQUIRED;
    }

    return hotels;
  } catch (error) {
    throw new Error(`Erro ao buscar hotéis: ${error.message}`);
  }
}

export { getHotels };
