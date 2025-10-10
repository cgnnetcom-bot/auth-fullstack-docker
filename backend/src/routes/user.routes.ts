import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

router.get('/me', authenticate, (req, res, next) => userController.getMe(req, res, next));

export default router;
