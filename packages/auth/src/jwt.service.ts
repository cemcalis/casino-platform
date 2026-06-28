import jwt from 'jsonwebtoken';
import type { JwtPayload } from './types';

export function signAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  const secret = process.env['JWT_ACCESS_SECRET'];
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set');
  return jwt.sign({ ...payload, type: 'access' }, secret, { expiresIn: '15m' });
}

export function signRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new Error('JWT_REFRESH_SECRET not set');
  return jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string, type: 'access' | 'refresh'): JwtPayload {
  const secret =
    type === 'access' ? process.env['JWT_ACCESS_SECRET'] : process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new Error(`JWT secret for ${type} not set`);
  const payload = jwt.verify(token, secret) as JwtPayload;
  if (payload.type !== type) throw new Error('Token type mismatch');
  return payload;
}
