import dotenv from 'dotenv';

dotenv.config();

function loadAndValidateEnv() {
  const loadedEnv = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  };

  if (!loadedEnv.jwtSecret) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    throw new Error('JWT_SECRET is required');
  }

  if (!loadedEnv.databaseUrl) {
    console.error('FATAL ERROR: DATABASE_URL is not defined in environment variables.');
    throw new Error('DATABASE_URL is required');
  }

  // TypeScript agora sabe que jwtSecret e databaseUrl são strings
  return loadedEnv as Omit<typeof loadedEnv, 'jwtSecret' | 'databaseUrl'> & { jwtSecret: string; databaseUrl: string };
}

export const env = loadAndValidateEnv();
