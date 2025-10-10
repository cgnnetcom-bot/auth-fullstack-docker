import { PrismaClient, User } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { randomBytes, randomInt } from 'crypto';
import { generateAccessToken, generateResetToken } from '../utils/jwt';
import { AppError } from './AppError';

export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async signup(name: string, email: string, password: string) {
    try {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new AppError('Email already registered', 409);
        }

        const passwordHash = await hashPassword(password);

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return user;

    } catch (error) {
        console.error('[AuthService.signup] Error:', error);
        throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = randomBytes(64).toString('hex');
    const hashedRefreshToken = await hashPassword(refreshToken);
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken, // Será enviado via HttpOnly cookie pelo controller
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If the email exists, a code has been sent' };
    }

    const code = randomInt(100000, 999999).toString();
    const codeHash = await hashPassword(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    });

    // Em produção, isso seria substituído por um serviço de envio de e-mail.
    // Ex: await emailService.sendPasswordResetCode(email, code);
    console.log(`[DEV ONLY] Password reset code for ${email}: ${code}`);

    const response = { message: 'If the email exists, a code has been sent' };
    if (process.env.NODE_ENV === 'development') {
      return { ...response, code };
    }

    return response;
  }

  async verifyCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Resposta genérica para evitar enumeração de usuários
      throw new AppError('Invalid code or email', 400);
    }

    const resetRequests = await this.prisma.passwordReset.findMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (resetRequests.length === 0) {
      throw new AppError('Invalid or expired code', 400);
    }

    let validRequest = null;

    for (const request of resetRequests) {
      const isValid = await comparePassword(code, request.codeHash);
      if (isValid) {
        validRequest = request;
        break;
      }
    }

    if (!validRequest) {
      throw new AppError('Invalid code', 400);
    }

    const resetToken = generateResetToken({
      userId: user.id,
      email: user.email,
    });

    return { resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const { verifyToken } = await import('../utils/jwt'); // Manter import dinâmico se houver dependência circular
    
    let decoded;
    try {
      decoded = verifyToken(resetToken);
    } catch (error) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('User not found', 400);
    }

    const passwordHash = await hashPassword(newPassword);
    const passwordChangedAt = new Date();

    // Usar transação para garantir atomicidade
    await this.prisma.$transaction([
      this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt,
      },
    }),
      this.prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    ]);

    return { message: 'Password successfully reset' };
  }

  async refreshToken(token: string) {
    const hashedToken = await hashPassword(token);

    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!refreshToken) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const newAccessToken = generateAccessToken({
      userId: refreshToken.user.id,
      email: refreshToken.user.email,
    });

    return { accessToken: newAccessToken };
  }

  async logout(token: string) {
    if (!token) {
      return { message: 'No refresh token provided' };
    }

    try {
      const hashedToken = await hashPassword(token);

      // Encontra e deleta o token
      const tokenToDelete = await this.prisma.refreshToken.findFirst({
        where: { token: hashedToken },
      });

      if (tokenToDelete) {
        await this.prisma.refreshToken.delete({
          where: { id: tokenToDelete.id },
        });
      }
    } catch (error) {
      // Ignora erros se o token já for inválido, o objetivo é deslogar
      console.error('[AuthService.logout] Error deleting refresh token:', error);
    }

    return { message: 'Logged out successfully' };
  }
}