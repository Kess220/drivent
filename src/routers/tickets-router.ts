import { Router } from 'express';
// eslint-disable-next-line prettier/prettier
import { getTicketTypesController, getTicketsController, createTicketController } from '../controllers/tickets-controller';
import { authenticateToken, validateBody } from '@/middlewares';
import { ticketTypeSchema } from '@/schemas/ticketsTypes-schemas';

const ticketsRouter = Router();

ticketsRouter.get('/types', authenticateToken, getTicketTypesController);
ticketsRouter.get('/', authenticateToken, getTicketsController);
ticketsRouter.post('/', authenticateToken, createTicketController);

export { ticketsRouter };
