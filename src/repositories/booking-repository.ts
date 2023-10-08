/* eslint-disable prettier/prettier */
import { prisma } from '@/config';

async function createBookingRepository(userId: number, roomId: number) {
  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });

  return booking.id;
}

async function isRoomFull(roomId: number) {
  const reservationCount = await prisma.booking.count({
    where: {
      roomId,
    },
  });

  const room = await prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });

  return {
    room: room as { id: number; capacity: number },
    reservationCount,
  };
}

async function getBookingByUserRepository(roomId: number) {
  return await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    select: {
      capacity: true,
      _count: {
        select: {
          Booking: true,
        },
      },
    },
  });
}

export const bookingRepository = { createBookingRepository, isRoomFull, getBookingByUserRepository };
