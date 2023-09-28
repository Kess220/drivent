/* eslint-disable prettier/prettier */
import supertest from 'supertest';
import { createHotel } from '../factories/hotel-factory';
import { cleanDb } from '../helpers';
import app from '@/app';

const server = supertest(app);

describe('Teste da rota GET /hotels', () => {
  beforeAll(async () => {
    // Insira os dados falsos de hotel no banco de dados antes de iniciar os testes
    await createHotel();
  });

  afterAll(async () => {
    // Limpeza após os testes
    await cleanDb(); // Chama a função para limpar a tabela de hotéis
  });

  it('Deve retornar status 201 ao acessar a rota /hotels', async () => {
    const response = await server.get('/hotels');

    // Verifique se o status da resposta é 201
    expect(response.status).toBe(201);
  });
});
