import request from 'supertest';
import app from '../server';
import prisma from '../prisma';
import bcrypt from 'bcrypt';

// Mocking o cliente Prisma
jest.mock('../prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// Mocking o bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('POST /auth/signup', () => {
  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    (prisma.user.findUnique as jest.Mock).mockClear();
    (prisma.user.create as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();
  });

  it('should create a new user and return 201', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    // Simula que o email não existe no banco
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    // Simula a criação do usuário
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', ...userData, passwordHash: 'hashed_password' });
    // Simula o hash da senha
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

    const response = await request(app)
      .post('/auth/signup')
      .send(userData);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(userData.email);
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
  });

  it('should return 409 if email already exists', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    // Simula que o email JÁ existe no banco
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', ...userData });

    const response = await request(app)
      .post('/auth/signup')
      .send(userData);

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe('Email already in use.');
  });
});