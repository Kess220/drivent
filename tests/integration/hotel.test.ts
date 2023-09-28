/* eslint-disable prettier/prettier */
// tests/integration/hotel.test.ts

import supertest from 'supertest';
import app from '@/app';

const server = supertest(app);

describe('GET /hotels', () => {
  it('Deve retornar status 201 ao acessar a rota /hotels', async () => {
    const response = await server.get('/hotels');

    // Verifique se o status da resposta é 201 (criado)
    expect(response.status).toBe(201);
  });
});
