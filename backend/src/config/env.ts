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
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  };

  const requiredVariables: (keyof typeof loadedEnv)[] = [
    'jwtSecret',
    'databaseUrl',
    'S3_ENDPOINT',
    'S3_BUCKET_NAME',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
  ];

  for (const variable of requiredVariables) {
    if (!loadedEnv[variable]) {
      console.error(`FATAL ERROR: ${variable} is not defined in environment variables.`);
      throw new Error(`${variable} is required`);
    }
  }

  return loadedEnv as Omit<typeof loadedEnv, 'jwtSecret' | 'databaseUrl'> & { 
    jwtSecret: string; 
    databaseUrl: string; 
    S3_ENDPOINT: string;
    S3_BUCKET_NAME: string;
    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;
  };
}

export const env = loadAndValidateEnv();