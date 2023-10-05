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

export async function isRoomFull(roomId: number) {
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
    room: room as { id: number; capacity: number }, // Use null se o quarto não existir
    reservationCount,
  };
}

export default { createBookingRepository, isRoomFull };
