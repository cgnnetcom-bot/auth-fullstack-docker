// backend/src/types/token-payload.ts
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}