/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getHotels() {
  const hotels = await prisma.hotel.findMany();
  return hotels;
}

export { getHotels };
