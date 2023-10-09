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
      roomId: roomId,
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

async function putBookingByUserIdRepository(bookingId: number, roomId: number) {
  const booking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
    select: {
      id: true,
    },
  });
  return booking;
}

async function getRoomByUserId(roomId: number) {
  return await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    select: {
      id: true,
      name: true,

      capacity: true,
      _count: {
        select: {
          Booking: true,
        },
      },
    },
  });
}

async function findBookingByUserId(userId: number) {
  return await prisma.room.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,

      capacity: true,
      hotelId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export const bookingRepository = {
  putBookingByUserIdRepository,
  createBookingRepository,
  isRoomFull,
  getBookingByUserRepository,
  getRoomByUserId,
  findBookingByUserId,
};
