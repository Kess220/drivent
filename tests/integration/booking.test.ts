/* eslint-disable prettier/prettier */
import request from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import { createEnrollmentWithAddress, createTicket, createTicketType, createPayment, createUser } from '../factories';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import app from '@/app';

describe('POST /bookings', () => {
  beforeAll(async () => {
    await cleanDb();
  });

  it('deve criar um booking com sucesso', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);

    const response = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id, roomId: room.id });

    expect(response.status).toBe(201);
  });
});
