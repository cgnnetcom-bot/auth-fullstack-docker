import { Router } from 'express';
import { FavoritesController } from '../controllers/favorites.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const favoritesController = new FavoritesController();

router.use(authMiddleware); // Aplica o middleware de proteção a todas as rotas abaixo

router.route('/').get(favoritesController.getAll).post(favoritesController.add);

router.route('/:id').delete(favoritesController.delete);

export default router;