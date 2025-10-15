// backend/src/types/express.d.ts
import type { TokenPayload } from './token-payload';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

export {};