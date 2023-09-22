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
        userId,
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

export const createTicket = async (userId: number, ticketTypeId: number) => {
  try {
    // Verificar se o usuário tem uma inscrição válida
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!enrollment) {
      throw new Error('User does not have a valid enrollment.');
    }

    // Criar um novo ingresso (ticket) com status RESERVED
    const ticket = await prisma.ticket.create({
      data: {
        status: 'RESERVED',
        ticketTypeId: ticketTypeId,
        enrollmentId: enrollment.id,
      },
      include: {
        TicketType: true,
      },
    });

    return ticket;
  } catch (error) {
    throw error;
  }
};
