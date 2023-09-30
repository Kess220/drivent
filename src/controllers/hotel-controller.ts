/* eslint-disable prettier/prettier */
import { Response } from 'express';
import { getHotels } from '../services/hotel-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function listHotels(req: AuthenticatedRequest, res: Response) {
  const hotels = await getHotels(req.userId);
  res.send(hotels);
}
