/* eslint-disable prettier/prettier */
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { TicketStatus } from '@prisma/client';
import {
  createEnrollmentWithAddress,
  createTicketType,
  createUser,
  createTicket,
  createHotel,
  createTicketTypeIsRemote,
  createTicketTypeincluedesHotel,
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
  it('Deve retornar status 401 se não houver token de autenticação', async () => {
    const response = await server.get('/hotels');

    // Verifique se o status da resposta é 401 (não autorizado)
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Deve responder com status 401 se não houver sessão para o token fornecido', async () => {
    // Crie um usuário sem sessão no banco de dados
    const userWithoutSession = await createUser();

    // Gere um token com o ID do usuário (simulando um token inválido)
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    // Faça uma solicitação à rota /hotels com o token inválido
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    // Verifique se a resposta possui status 401 (não autorizado)
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Deve retornar 404 caso não tenha hotels', async () => {
    // Crie um usuário no banco de dados
    const user = await createUser();

    // Gere um token de autenticação válido para o usuário
    const token = await generateValidToken(user);

    // Crie um hotel no banco de dados
    // await createHotel();

    // Faça uma solicitação à rota /hotels com o token válido
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    // Verifique se a resposta possui status 404(NOT_FOUND)
    expect(response.status).toBe(httpStatus.NOT_FOUND);

    // console.log('Hotéis disponíveis:', response.body);
  });

  it('Deve retornar status 402 se o ticket for remoto ', async () => {
    // Crie um usuário no banco de dados
    const user = await createUser();

    // Gere um token de autenticação válido para o usuário
    const token = await generateValidToken(user);

    // Crie um hotel no banco de dados
    await createHotel();

    // Crie uma inscrição (enrollment) para o usuário
    const enrollment = await createEnrollmentWithAddress(user);

    // Crie um tipo de ticket remoto que não inclui hotel

    // Crie um tipo de ticket com hotéis disponíveis
    const ticketType = await createTicketTypeIsRemote();

    // Crie um ticket pago para a inscrição e o tipo de ticket
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    // Faça uma solicitação à rota /hotels com o token válido
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    // Verifique se a resposta possui status 402(PAYMENT_REQUIRED)
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);

    // console.log('Hotéis disponíveis:', response.body);
  });
});

describe('Teste da rota GET /hotels', () => {
  it('Retorna 404 caso não tenha enrollment', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createHotel();
    const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it('Retorna 404 se não houver ticket', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createHotel();
    await createEnrollmentWithAddress(user);
    const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it('Deve retornar status 402 se o ticket não incluir hotel ', async () => {
    // Crie um usuário no banco de dados
    const user = await createUser();

    // Gere um token de autenticação válido para o usuário
    const token = await generateValidToken(user);

    // Crie um hotel no banco de dados
    await createHotel();

    // Crie uma inscrição (enrollment) para o usuário
    const enrollment = await createEnrollmentWithAddress(user);

    // Crie um tipo de ticket remoto que não inclui hotel

    // Crie um tipo de ticket com hotéis disponíveis
    const ticketType = await createTicketTypeincluedesHotel();

    // Crie um ticket pago para a inscrição e o tipo de ticket
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    // Faça uma solicitação à rota /hotels com o token válido
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    // Verifique se a resposta possui status 402(PAYMENT_REQUIRED)
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);

    // console.log('Hotéis disponíveis:', response.body);
  });
});
