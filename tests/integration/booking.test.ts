/* eslint-disable prettier/prettier */
import supertest from 'supertest';
import httpStatus from 'http-status';
import { TicketStatus } from '@prisma/client';
import { createUser, createTicketType, createTicket, createEnrollmentWithAddress, createPayment } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import app, { init } from '@/app';
import { prisma } from '@/config';

describe('POST /bookings', () => {
  beforeAll(async () => {
    // Inicialize o aplicativo antes de começar o teste
    console.log('Iniciando o aplicativo...');
    await init();
    // Limpe o banco de dados de teste antes de começar o teste
    console.log('Limpando o banco de dados...');
    await cleanDb();
  });

  it('deve criar um booking com sucesso', async () => {
    // Crie um usuário
    console.log('Criando um usuário...');
    const user = await createUser();

    // Gere um token de autenticação válido
    console.log('Gerando um token de autenticação...');
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);

    // Crie um hotel
    console.log('Criando um hotel...');
    const hotel = await createHotel();

    // Crie um quarto associado ao hotel
    console.log('Criando um quarto...');
    const room = await createRoomWithHotelId(hotel.id);

    // Verifique se os IDs existem
    console.log('IDs:', {
      userId: user.id,
      roomId: room.id,
      ticketId: ticket.id,
    });

    try {
      // Use a função de serviço para criar o booking
      console.log('Criando um booking usando o serviço...');
      const response = await supertest(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: user.id, roomId: room.id });

      // Verifique se a resposta da rota é a esperada
      console.log('Verificando a resposta da rota...');
      expect(response.status).toBe(httpStatus.CREATED);
      // Adicione outras verificações conforme necessário
    } catch (error) {
      // Se ocorrer um erro ao criar o booking, trate-o conforme necessário
      // Isso pode incluir lidar com erros de validação ou outros
      // Certifique-se de que a lógica de erro corresponda ao seu aplicativo
      console.error('Erro ao criar o booking:', error);
    }
  });
});
