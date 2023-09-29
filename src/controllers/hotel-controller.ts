/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import { Response } from 'express';
import { getHotels } from '../services/hotel-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function listHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const hotels = await getHotels(userId);

    return res.status(httpStatus.OK).json(hotels);
  } catch (error) {
    console.error(`Erro ao listar hotéis: ${error.message}`);

    if (error.message === 'Nenhum hotel encontrado.') {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Nenhum hotel encontrado.' });
    } else if (
      error.message === 'Nenhum ticket encontrado para este usuário.' ||
      error.message === 'Ticket não foi pago, é remoto ou não inclui hotel.'
    ) {
      return res
        .status(httpStatus.PAYMENT_REQUIRED)
        .json({ message: 'Ticket não foi pago, é remoto ou não inclui hotel.' });
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erro ao listar hotéis.' });
    }
  }
}
