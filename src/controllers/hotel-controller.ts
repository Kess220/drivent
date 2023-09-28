/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import { Response } from 'express';
import { getHotels } from '../services/hotel-service';
import { ticketsService } from '../services/tickets-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function listHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const hotels = await getHotels();
    const ticket = await ticketsService.getTicketByUserId(userId);

    if (!hotels || hotels.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Nenhum hotel encontrado.' });
    }

    if (!ticket) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Nenhum ticket encontrado para este usuário.' });
    }

    if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
      return res
        .status(httpStatus.PAYMENT_REQUIRED)
        .json({ message: 'Ticket não foi pago, é remoto ou não inclui hotel.' });
    }

    return res.status(httpStatus.OK).json(hotels);
  } catch (error) {
    console.error(`Erro ao listar hotéis: ${error.message}`);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erro ao listar hotéis.' });
  }
}
