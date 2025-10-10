import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await userService.getMe(req.user.userId);

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}
