import { Request, Response } from 'express';
import { getAllTicketTypesService, getTicketByUserIdService, createTicketService } from '../services/tickets-service';
import { prisma } from '@/config';

export const getTicketTypesController = async (req: Request, res: Response) => {
  try {
    const ticketTypes = await getAllTicketTypesService();

    res.json(ticketTypes);
  } catch (error) {
    console.error('Error in getTicketTypesController:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getTicketsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Recupere o ID do usuário da sessão (você precisa implementar a autenticação do usuário)
    const idUser = req.userId;

    const ticket = await getTicketByUserIdService(idUser);

    if (!ticket) {
      return res.status(404).json({ error: 'User has no ticket.' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error in getTicketsController:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createTicketController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { ticketTypeId } = req.body;

    if (!ticketTypeId) {
      return res.status(400).json({ error: 'ticketTypeId is required in the request body.' });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'User does not have a valid enrollment.' });
    }

    // Criar o ingresso
    const ticket = await createTicketService(userId, ticketTypeId);

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error in createTicketController:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

interface AuthenticatedRequest extends Request {
  userId: number;
}
