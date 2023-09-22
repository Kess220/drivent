import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTicketTypes = async () => {
  try {
    const ticketTypes = await prisma.ticketType.findMany();
    return ticketTypes;
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    throw error;
  }
};

export const getTicketByUserId = async (userId: number) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId: userId,
      },
      include: {
        Ticket: {
          include: {
            TicketType: true,
          },
        },
      },
    });

    if (!enrollment) {
      return null; // Retorne null se o usuário não tiver uma inscrição
    }

    return enrollment.Ticket;
  } catch (error) {
    throw error;
  }
};
