import { Router } from 'express';
import { MovieController } from '../controllers/movies.controller';

const router = Router();
const movieController = new MovieController();

// Estas rotas são PÚBLICAS e não devem usar o middleware 'protect'.
router.get('/popular', movieController.getPopular);
router.get('/search', movieController.search);

// Se houvesse rotas de filmes que precisassem de proteção, elas seriam definidas aqui,
// usando o middleware 'protect' individualmente. Ex: router.get('/private-stuff', protect, someController);

export default router;