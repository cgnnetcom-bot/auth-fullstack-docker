import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../prisma';
import { AppError } from '../services/AppError';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Token não fornecido ou mal formatado.', 401));
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    // 1. Verifica se o usuário do token ainda existe no banco de dados
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!currentUser) {
      return next(new AppError('O usuário deste token não existe mais.', 401));
    }

    // 2. (Opcional, mas recomendado) Verifica se a senha foi alterada após a emissão do token
    if (currentUser.passwordChangedAt) {
      const tokenIssuedAt = new Date(decoded.iat! * 1000);
      if (currentUser.passwordChangedAt > tokenIssuedAt) {
        return next(new AppError('Senha alterada recentemente. Por favor, faça login novamente.', 401));
      }
    }

    // 3. Anexa o payload do usuário ao objeto de requisição e continua
    req.user = { userId: decoded.userId, email: decoded.email }; // Use the verified payload from the token
    next();
  } catch (error) {
    // Captura erros de jwt.verify (token inválido, expirado) e os encaminha de forma clara.
    next(new AppError('Token inválido ou expirado. Por favor, faça login novamente.', 401));
  }
};