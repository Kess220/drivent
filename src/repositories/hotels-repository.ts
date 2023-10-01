/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getHotelsRepository() {
  const hotels = await prisma.hotel.findMany();
  return hotels;
}

async function getTicketID(enrollmentId: number) {
  return await prisma.ticket.findUnique({
    where: { enrollmentId },
    include: { TicketType: true },
  });
}

async function enrollmentGetId(userId: number) {
  return await prisma.enrollment.findUnique({
    where: {
      userId,
    },
  });
}

async function getHotelRoomRepository(hotelId: number) {
  return await prisma.hotel.findUnique({ where: { id: hotelId }, include: { Rooms: true } });
}

export { getHotelsRepository, getTicketID, enrollmentGetId, getHotelRoomRepository };
