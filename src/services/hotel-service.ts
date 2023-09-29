/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import { getHotels as getHotelsRepository } from '../repositories/hotels-repository';
import { ticketsService } from './tickets-service';
import { notFoundError } from '@/errors';

async function getHotels(userId: number) {
  try {
    const hotels = await getHotelsRepository();
    const ticket = await ticketsService.getTicketByUserId(userId);

    if (!hotels || hotels.length === 0) {
      throw notFoundError();
    }

    if (!ticket || !hotels) {
      throw notFoundError();
    }

    if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
      return httpStatus.PAYMENT_REQUIRED; // Retorna o status 402 (Payment Required)
    }

    return hotels;
  } catch (error) {
    throw new Error(`Erro ao buscar hotéis: ${error.message}`);
  }
}

export { getHotels };
