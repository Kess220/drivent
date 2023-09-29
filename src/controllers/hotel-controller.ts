/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import { Response } from 'express';
import { getHotels } from '../services/hotel-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function listHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const hotelsOrStatus = await getHotels(userId);

    if (hotelsOrStatus === httpStatus.NOT_FOUND) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Nenhum hotel encontrado.' });
    }

    if (hotelsOrStatus === httpStatus.PAYMENT_REQUIRED) {
      return res.status(httpStatus.PAYMENT_REQUIRED).json({ message: 'Requer pagamento.' });
    }

    return res.status(httpStatus.OK).json(hotelsOrStatus);
  } catch (error) {
    console.error(`Erro ao listar hotéis: ${error.message}`);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erro ao listar hotéis.' });
  }
}
