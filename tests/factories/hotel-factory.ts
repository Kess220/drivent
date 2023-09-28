/* eslint-disable prettier/prettier */
import faker from '@faker-js/faker';
import { Hotel } from '@prisma/client';
import { prisma } from '@/config';

export async function createHotel(params: Partial<Hotel> = {}): Promise<Hotel> {
  try {
    const fakeHotel = {
      id: faker.datatype.number(),
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...params,
    };

    // Insira os dados falsos de hotel no banco de dados usando o Prisma
    const insertedHotel = await prisma.hotel.create({
      data: fakeHotel,
    });

    return insertedHotel;
  } catch (error) {
    throw new Error(`Erro ao inserir dados falsos de hotel: ${error.message}`);
  }
}
