import 'dotenv/config'; // Garante que as variáveis de ambiente sejam carregadas primeiro
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { AppError } from './services/AppError';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movies.routes';
import favoriteRoutes from './routes/favorites.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Rotas da API
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/me', userRoutes);

// Rota de Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Middleware de tratamento de erros global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
});