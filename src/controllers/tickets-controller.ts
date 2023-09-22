import { Request, Response } from 'express';
import { getAllTicketTypesService, getTicketByUserIdService } from '../services/tickets-service';

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

interface AuthenticatedRequest extends Request {
  userId: number;
}
