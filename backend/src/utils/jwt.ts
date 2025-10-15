import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { TokenPayload } from './token-payload';

export const generateToken = (payload: Pick<TokenPayload, 'userId' | 'email'>): string => {
  const secret = env.jwtSecret as Secret;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }

  // Usa número para evitar confusão de tipo em expiresIn
  const options: SignOptions = { expiresIn: 60 * 60 * 24 * 7 }; // 7 dias
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = env.jwtSecret as Secret;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  return jwt.verify(token, secret) as TokenPayload;
};
