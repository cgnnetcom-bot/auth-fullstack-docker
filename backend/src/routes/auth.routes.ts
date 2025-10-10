import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/verify-code', (req, res, next) => authController.verifyCode(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

export default router;
