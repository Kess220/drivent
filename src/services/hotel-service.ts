/* eslint-disable prettier/prettier */
import { getHotels as getHotelsRepository } from '../repositories/hotels-repository';
import { ticketsService } from './tickets-service';

async function getHotels(userId: number) {
  try {
    const hotels = await getHotelsRepository();
    const ticket = await ticketsService.getTicketByUserId(userId);

    if (!hotels || hotels.length === 0) {
      throw new Error('Nenhum hotel encontrado.');
    }

    if (!ticket) {
      throw new Error('Nenhum ticket encontrado para este usuário.');
    }

    if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
      throw new Error('Ticket não foi pago, é remoto ou não inclui hotel.');
    }

    return hotels;
  } catch (error) {
    throw new Error(`Erro ao buscar hotéis: ${error.message}`);
  }
}

export { getHotels };
