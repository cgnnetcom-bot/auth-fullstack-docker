import request from 'supertest';
import app from './server'; // Importa a instância do app Express

describe('Health Check Endpoint', () => {
  it('should respond with status 200 and OK message on GET /health', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});