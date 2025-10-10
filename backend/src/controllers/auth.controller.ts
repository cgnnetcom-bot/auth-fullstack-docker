import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from '../utils/validators';

const prisma = new PrismaClient(); // Ou importe de um arquivo centralizado
const authService = new AuthService(prisma);

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = signupSchema.parse(req.body);
      const user = await authService.signup(
        validatedData.name,
        validatedData.email,
        validatedData.password
      );

      res.status(201).json({
        message: 'User created successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(
        validatedData.email,
        validatedData.password
      );

      const { refreshToken, ...data } = result;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(validatedData.email);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyCode(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = verifyCodeSchema.parse(req.body);
      const result = await authService.verifyCode(
        validatedData.email,
        validatedData.code
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(
        validatedData.resetToken,
        validatedData.newPassword
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        throw new AppError('Refresh token not found', 401);
      }

      const result = await authService.refreshToken(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      await authService.logout(token);

      res.clearCookie('refreshToken', { path: '/' });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}
