/* eslint-disable prettier/prettier */
import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createBooking,
  createBookingData,
  createEnrollmentWithAddress,
  createRoom,
  createRoomFull,
  createTicket,
  createTicketType,
  createUser,
} from '../factories';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import { bookingService } from '@/services/booking-service';
import { bookingRepository } from '@/repositories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);
describe('POST /booking (Token Authentication Tests)', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should respond with status 401 if token is missing "Bearer" prefix', async () => {
    const tokenWithoutBearer = 'token-sem-prefixo-bearer';

    const response = await server.post('/booking').set('Authorization', tokenWithoutBearer);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Should respond with 404 (NOT_FOUND) when the room doesnt exist', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it('Should respond with 403 (FORBIDDEN) if the room already reached max capacity', async () => {
    const user = await createUser();
    await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const room = await createRoomFull();
    await createBookingData(user.id, room.id);

    const user2 = await createUser();
    const tokenUser2 = await generateValidToken(user2);
    const enrollment2 = await createEnrollmentWithAddress(user2);
    await createTicket(enrollment2.id, ticketType.id, 'PAID');

    const { status } = await server
      .post('/booking')
      .set('Authorization', `Bearer ${tokenUser2}`)
      .send({ roomId: room.id });
    expect(status).toBe(httpStatus.FORBIDDEN);
  });

  it('Should respond with 200 (OK) if everything is ok', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const room = await createRoom();
    const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(status).toBe(httpStatus.OK);
  });
});

describe('ticket', () => {
  it('response 403 is ticker remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, true);
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const room = await createRoom();
    const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(status).toBe(httpStatus.FORBIDDEN);
  });

  it('response 403 ticket is not have hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, false);
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const room = await createRoom();
    const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(status).toBe(httpStatus.FORBIDDEN);
  });

  it('response 403 ticket is not PAID', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, 'RESERVED');
    const room = await createRoom();
    const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(status).toBe(httpStatus.FORBIDDEN);
  });

  it('response 403 ticket is not have hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, false);
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const room = await createRoom();
    const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(status).toBe(httpStatus.FORBIDDEN);
  });

  it('response 403 ticket is not PAID', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, 'RESERVED');
    const room = await createRoom();
    const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(status).toBe(httpStatus.FORBIDDEN);
  });

  it('Should respond with 200 (OK) if everything is ok', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const room = await createRoom();
    const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(status).toBe(httpStatus.OK);
  });
});

describe('Booking Service Get Booking Tests', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Respond with 404 if not have a booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const { status } = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  // Error prima count, não faço a minima ideia do que seja mas irei tentar resolver mais tarde

  it('Should respond with 200 (OK) if everything is ok', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const createdHotel = await createHotel();
    await createRoomWithHotelId(createdHotel.id);

    const room = await createRoom();
    await createBooking(user.id, room.id);
    const { status } = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(status).toBe(httpStatus.OK);
  });
});
