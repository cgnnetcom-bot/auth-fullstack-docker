import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}
