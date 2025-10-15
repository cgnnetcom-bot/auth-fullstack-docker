import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const user = await userService.getMe(req.user.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}