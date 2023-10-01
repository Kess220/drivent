/* eslint-disable prettier/prettier */
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { TicketStatus } from '@prisma/client';
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createHotel,
  createTicketTypeIsRemote,
  createTicketTypeincluedesNotHotel,
  createTicketTypeSucess,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe('Teste da rota GET /hotels', () => {
  describe('Quando não há token de autenticação', () => {
    it('Deve retornar status 401', async () => {
      const response = await server.get('/hotels');
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('Quando o token é inválido ou não possui sessão', () => {
    it('Deve responder com status 401', async () => {
      // Crie um usuário sem sessão no banco de dados
      const userWithoutSession = await createUser();

      // Gere um token com o ID do usuário (simulando um token inválido)
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      // Faça uma solicitação à rota /hotels com o token inválido
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      // Verifique se a resposta possui status 401 (não autorizado)
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('Quando não há hotéis disponíveis', () => {
    it('Deve retornar status 404', async () => {
      // Crie um usuário no banco de dados
      const user = await createUser();

      // Gere um token de autenticação válido para o usuário
      const token = await generateValidToken(user);

      // Faça uma solicitação à rota /hotels com o token válido
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      // Verifique se a resposta possui status 404 (NOT_FOUND)
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  describe('Quando o ticket é remoto e não inclui hotel', () => {
    it('Deve retornar status 402', async () => {
      // Crie um usuário no banco de dados
      const user = await createUser();

      // Gere um token de autenticação válido para o usuário
      const token = await generateValidToken(user);

      // Crie um hotel no banco de dados
      await createHotel();

      // Crie uma inscrição (enrollment) para o usuário
      const enrollment = await createEnrollmentWithAddress(user);

      // Crie um tipo de ticket remoto que não inclui hotel

      const ticketType = await createTicketTypeIsRemote();

      // Crie um ticket pago para a inscrição e o tipo de ticket
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      // Faça uma solicitação à rota /hotels com o token válido
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      // Verifique se a resposta possui status 402 (PAYMENT_REQUIRED)
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
  });

  describe('Quando não há enrollment', () => {
    beforeEach(async () => {
      await cleanDb(); // Limpe o banco de dados antes de cada teste
    });
    it('Deve retornar status 404', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createHotel();
      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });
  });

  describe('Quando não há ticket', () => {
    beforeEach(async () => {
      await cleanDb(); // Limpe o banco de dados antes de cada teste
    });
    it('Deve retornar status 404', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createHotel();
      await createEnrollmentWithAddress(user);
      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });
  });

  describe('Quando o ticket não inclui hotel', () => {
    beforeEach(async () => {
      await cleanDb(); // Limpe o banco de dados antes de cada teste
    });
    it('Deve retornar status 402', async () => {
      // Crie um usuário no banco de dados
      const user = await createUser();

      // Gere um token de autenticação válido para o usuário
      const token = await generateValidToken(user);

      // Crie um hotel no banco de dados
      await createHotel();

      // Crie uma inscrição (enrollment) para o usuário
      const enrollment = await createEnrollmentWithAddress(user);

      // Crie um tipo de ticket remoto que não inclui hotel

      const ticketType = await createTicketTypeincluedesNotHotel();

      // Crie um ticket pago para a inscrição e o tipo de ticket
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      // Faça uma solicitação à rota /hotels com o token válido
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      // Verifique se a resposta possui status 402 (PAYMENT_REQUIRED)
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
  });

  describe('Retorna os hoteis no sucesso', () => {
    beforeEach(async () => {
      await cleanDb(); // Limpe o banco de dados antes de cada teste
    });
    it('Deve retornar status 200', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createHotel();

      // Crie uma inscrição (enrollment) para o usuário
      const enrollment = await createEnrollmentWithAddress(user);

      // Crie um tipo de ticket remoto que não inclui hotel

      const ticketType = await createTicketTypeSucess();

      // Crie um ticket pago para a inscrição e o tipo de ticket
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      // Faça uma solicitação à rota /hotels com o token válido
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      // Verifique se a resposta possui status 402 (PAYMENT_REQUIRED)
      expect(response.status).toBe(httpStatus.OK);
    });

    it('Deve retornar tudo ok com status 200 (ok)', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSucess();
      await createTicket(enrollment.id, ticketType.id, 'PAID');
      const { status, body } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.OK);
      expect(body).toEqual({
        ...hotel,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [],
      });
    });
  });
});

describe('Teste da rota GET /hotels/hotelId', () => {
  describe('Quando não há token de autenticação', () => {
    it('Deve retornar 401 caso não tenha token', async () => {
      const response = await server.get('/hotels/1');

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Deve responder com status 401 como  token invalido', async () => {
      // Crie um usuário sem sessão no banco de dados
      const userWithoutSession = await createUser();

      // Gere um token com o ID do usuário (simulando um token inválido)
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      // Faça uma solicitação à rota /hotels com o token inválido
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      // Verifique se a resposta possui status 401 (não autorizado)
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Deve retornar status 404 caso não tenha enrollment', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createHotel();
      const { status } = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });

    it('Deve retornar status 404 caso não tenha ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createHotel();
      await createEnrollmentWithAddress(user);
      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });

    // it('Deve retornar status 402', async () => {
    //   // Crie um usuário no banco de dados
    //   const user = await createUser();

    //   // Gere um token de autenticação válido para o usuário
    //   const token = await generateValidToken(user);

    //   // Crie um hotel no banco de dados
    //   await createHotel();

    //   // Crie uma inscrição (enrollment) para o usuário
    //   const enrollment = await createEnrollmentWithAddress(user);

    //   // Crie um tipo de ticket remoto que não inclui hotel

    //   const ticketType = await createTicketTypeSucess();

    //   // Crie um ticket pago para a inscrição e o tipo de ticket
    //   await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    //   // Faça uma solicitação à rota /hotels com o token válido
    //   const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

    //   // Verifique se a resposta possui status 402 (PAYMENT_REQUIRED)
    //   expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    // });
  });

  describe('Quando o ticket não inclui hotel', () => {
    beforeEach(async () => {
      await cleanDb(); // Limpe o banco de dados antes de cada teste
    });
    it('Deve retornar status 402', async () => {
      // Crie um usuário no banco de dados
      const user = await createUser();

      // Gere um token de autenticação válido para o usuário
      const token = await generateValidToken(user);

      // Crie um hotel no banco de dados
      await createHotel();

      // Crie uma inscrição (enrollment) para o usuário
      const enrollment = await createEnrollmentWithAddress(user);

      // Crie um tipo de ticket remoto que não inclui hotel

      const ticketType = await createTicketTypeincluedesNotHotel();

      // Crie um ticket pago para a inscrição e o tipo de ticket
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      // Faça uma solicitação à rota /hotels com o token válido
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      // Verifique se a resposta possui status 402 (PAYMENT_REQUIRED)
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
  });
});
