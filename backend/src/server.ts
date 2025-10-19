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
import imageRoutes from './routes/image.routes';
import albumRoutes from './routes/album.routes';
import { s3 } from './config/s3';
import { CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  next();
});

// Rotas da API
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/me', userRoutes);
app.use('/images', imageRoutes);
app.use('/albums', albumRoutes);

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

const createBucketIfNotExists = async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET_NAME }));
    console.log('S3 Bucket already exists.');
  } catch (error: any) {
    if (error.name === 'NotFound') {
      try {
        await s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET_NAME }));
        console.log('S3 Bucket created successfully.');
      } catch (createError) {
        console.error('Error creating S3 bucket:', createError);
      }
    } else {
      console.error('Error checking S3 bucket:', error);
    }
  }
};

app.listen(env.port, async () => {
  await createBucketIfNotExists();
  console.log(`🚀 Server running on port ${env.port}`);
});
