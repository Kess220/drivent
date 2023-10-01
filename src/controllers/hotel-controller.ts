/* eslint-disable prettier/prettier */
import { Response } from 'express';
import { getHotels, getHotelWithRoomsById } from '../services/hotel-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function listHotels(req: AuthenticatedRequest, res: Response) {
  const hotels = await getHotels(req.userId);
  res.send(hotels);
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  const hotelId = parseInt(req.params.hotelId, 10);

  // Chama o serviço para obter informações sobre o hotel com quartos pelo ID
  const hotel = await getHotelWithRoomsById(req.userId, hotelId);

  res.send(hotel);
}
