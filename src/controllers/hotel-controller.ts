/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import { Response } from 'express';
import { getHotels } from '../services/hotel-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function listHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const hotelsOrStatus = await getHotels(userId);

    if (typeof hotelsOrStatus === 'number') {
      return res.status(hotelsOrStatus).json({ message: httpStatus[hotelsOrStatus] });
    }

    return res.status(httpStatus.OK).json(hotelsOrStatus);
  } catch (error) {
    console.error(`Erro ao listar hotéis: ${error.message}`);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erro ao listar hotéis.' });
  }
}
