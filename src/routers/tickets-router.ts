import { Router } from 'express';
import { getTicketTypesController, getTicketsController } from '../controllers/tickets-controller';
import { authenticateToken } from '@/middlewares';

const ticketsRouter = Router();

ticketsRouter.get('/types', authenticateToken, getTicketTypesController);
ticketsRouter.get('/', getTicketsController);

export { ticketsRouter };
