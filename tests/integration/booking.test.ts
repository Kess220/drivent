/* eslint-disable prettier/prettier */
import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createBookingData,
  createEnrollmentWithAddress,
  createRoom,
  createTicket,
  createTicketType,
  createUser,
} from '../factories';
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
    const room = await createRoom(1);
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
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  test('should return a booking when a valid booking ID is provided', async () => {
    const userId = 1;

    // Dados simulados de reserva para o ID de reserva fornecido
    const mockBookingData = {
      capacity: 2,
      _count: {
        Booking: 1,
      },
    };

    // Use spyOn para substituir a implementação de findById no bookingRepository
    jest.spyOn(bookingRepository, 'getBookingByUserRepository').mockResolvedValue(mockBookingData);

    // Chame a função getBooking
    const result = await bookingService.getBookingByUser(userId);

    expect(bookingRepository.getBookingByUserRepository).toHaveBeenCalledWith(userId);

    // Verifique se o resultado é o esperado
    expect(result).toEqual(mockBookingData);
  });

  test('should return null when an invalid booking ID is provided', async () => {
    const invalidUserId = 9999;

    jest.spyOn(bookingRepository, 'getBookingByUserRepository').mockResolvedValue(null);

    // Chame a função getBooking com um ID de reserva inválido
    const result = await bookingService.getBookingByUser(invalidUserId);

    // Verifique se a função findById foi chamada com o argumento correto
    expect(bookingRepository.getBookingByUserRepository).toHaveBeenCalledWith(invalidUserId);

    // Verifique se o resultado é nulo
    expect(result).toBeNull();
  });
});
