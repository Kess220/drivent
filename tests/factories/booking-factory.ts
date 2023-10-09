/* eslint-disable prettier/prettier */
import faker from '@faker-js/faker';
import { User } from '@prisma/client';
import { prisma } from '@/config';

// Função para gerar dados fictícios de reserva
async function createBookingData(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}
const capacityNumber = 20;
async function createRoom(capacity = capacityNumber) {
  const hotel = await prisma.hotel.create({
    data: {
      image: faker.internet.url(),
      name: faker.company.companyName(),
    },
  });

  return await prisma.room.create({
    data: {
      hotelId: hotel.id,
      name: 'Hotel Calabreso',
      capacity,
    },
    select: {
      id: true,
    },
  });
}

async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

export async function createBookingOk(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function createRoomFull(capacity = 1) {
  const hotel = await prisma.hotel.create({
    data: {
      image: faker.internet.url(),
      name: faker.company.companyName(),
    },
  });

  return await prisma.room.create({
    data: {
      hotelId: hotel.id,
      name: 'Hotel Araraquaro',
      capacity,
    },
    select: {
      id: true,
    },
  });
}
export { createBookingData, createRoom, createRoomFull, createBooking };
