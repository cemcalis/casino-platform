import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { signAccessToken, signRefreshToken, verifyToken } from './jwt.service';

const TEST_ACCESS_SECRET = 'test-access-secret-for-unit-tests';
const TEST_REFRESH_SECRET = 'test-refresh-secret-for-unit-tests';

const BASE_PAYLOAD = { sub: 'user-123', email: 'test@example.com', role: 'PLAYER' };

describe('jwt.service', () => {
  beforeAll(() => {
    process.env['JWT_ACCESS_SECRET'] = TEST_ACCESS_SECRET;
    process.env['JWT_REFRESH_SECRET'] = TEST_REFRESH_SECRET;
  });

  afterAll(() => {
    delete process.env['JWT_ACCESS_SECRET'];
    delete process.env['JWT_REFRESH_SECRET'];
  });

  describe('signAccessToken', () => {
    it('returns a non-empty string JWT', () => {
      const token = signAccessToken(BASE_PAYLOAD);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // header.payload.signature
    });

    it('throws when JWT_ACCESS_SECRET is not set', () => {
      const saved = process.env['JWT_ACCESS_SECRET'];
      delete process.env['JWT_ACCESS_SECRET'];
      expect(() => signAccessToken(BASE_PAYLOAD)).toThrow('JWT_ACCESS_SECRET not set');
      process.env['JWT_ACCESS_SECRET'] = saved;
    });
  });

  describe('signRefreshToken', () => {
    it('returns a non-empty string JWT', () => {
      const token = signRefreshToken(BASE_PAYLOAD);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('throws when JWT_REFRESH_SECRET is not set', () => {
      const saved = process.env['JWT_REFRESH_SECRET'];
      delete process.env['JWT_REFRESH_SECRET'];
      expect(() => signRefreshToken(BASE_PAYLOAD)).toThrow('JWT_REFRESH_SECRET not set');
      process.env['JWT_REFRESH_SECRET'] = saved;
    });
  });

  describe('verifyToken', () => {
    it('decodes an access token and returns correct payload shape', () => {
      const token = signAccessToken(BASE_PAYLOAD);
      const decoded = verifyToken(token, 'access');
      expect(decoded.sub).toBe(BASE_PAYLOAD.sub);
      expect(decoded.email).toBe(BASE_PAYLOAD.email);
      expect(decoded.role).toBe(BASE_PAYLOAD.role);
      expect(decoded.type).toBe('access');
    });

    it('decodes a refresh token and returns correct payload shape', () => {
      const token = signRefreshToken(BASE_PAYLOAD);
      const decoded = verifyToken(token, 'refresh');
      expect(decoded.sub).toBe(BASE_PAYLOAD.sub);
      expect(decoded.email).toBe(BASE_PAYLOAD.email);
      expect(decoded.role).toBe(BASE_PAYLOAD.role);
      expect(decoded.type).toBe('refresh');
    });

    it('throws when passing an access token to verifyToken with type "refresh"', () => {
      const accessToken = signAccessToken(BASE_PAYLOAD);
      // Access token is signed with a different secret, so verification itself will fail
      // (even if the secrets happened to be the same, type mismatch guard would catch it)
      expect(() => verifyToken(accessToken, 'refresh')).toThrow();
    });

    it('throws when passing a refresh token to verifyToken with type "access"', () => {
      const refreshToken = signRefreshToken(BASE_PAYLOAD);
      expect(() => verifyToken(refreshToken, 'access')).toThrow();
    });

    it('throws when the secret for the requested type is not set', () => {
      const saved = process.env['JWT_ACCESS_SECRET'];
      delete process.env['JWT_ACCESS_SECRET'];
      // We need a valid token — create it first, then clear the env var
      process.env['JWT_ACCESS_SECRET'] = TEST_ACCESS_SECRET;
      const token = signAccessToken(BASE_PAYLOAD);
      delete process.env['JWT_ACCESS_SECRET'];
      expect(() => verifyToken(token, 'access')).toThrow('JWT secret for access not set');
      process.env['JWT_ACCESS_SECRET'] = saved;
    });

    it('throws on a tampered / invalid token string', () => {
      expect(() => verifyToken('not.a.valid.jwt', 'access')).toThrow();
    });
  });
});
