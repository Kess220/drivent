/* eslint-disable prettier/prettier */
import faker from '@faker-js/faker';
import { Hotel, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createHotel(params: Partial<Hotel> = {}): Promise<Hotel> {
  return prisma.hotel.create({
    data: {
      name: params.name || faker.name.findName(),
      image: params.image || faker.internet.url(),
      updatedAt: params.updatedAt || new Date(),
    },
  });
}
