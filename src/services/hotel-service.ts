/* eslint-disable prettier/prettier */

import { getHotels as getHotelsRepository } from '../repositories/hotels-repository';

async function getHotels() {
  try {
    const hotels = await getHotelsRepository();
    return hotels;
  } catch (error) {
    throw new Error(`Erro ao buscar hotéis no serviço: ${error.message}`);
  }
}

export { getHotels };
