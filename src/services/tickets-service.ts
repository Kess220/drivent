// eslint-disable-next-line prettier/prettier
import { getAllTicketTypes, getTicketByUserId, createTicket } from '../repositories/tickets-repository';

export const getAllTicketTypesService = async () => {
  try {
    const ticketTypes = await getAllTicketTypes();
    return ticketTypes;
  } catch (error) {
    console.error('Error in getAllTicketTypesService:', error);
    throw new Error('Failed to retrieve ticket types. Please try again later.');
  }
};

export const getTicketByUserIdService = async (userId: number) => {
  try {
    const ticket = await getTicketByUserId(userId);
    return ticket;
  } catch (error) {
    throw error;
  }
};

export const createTicketService = async (userId: number, ticketTypeId: number) => {
  try {
    const ticket = await createTicket(userId, ticketTypeId);
    return ticket;
  } catch (error) {
    throw error;
  }
};
