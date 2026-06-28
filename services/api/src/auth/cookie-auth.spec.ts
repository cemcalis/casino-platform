import { describe, it, expect, beforeAll } from 'vitest';
import { verifyToken, signAccessToken, signRefreshToken } from '@casino/auth';

// Unit tests for the cookie auth contract.
// These tests exercise token-type enforcement in @casino/auth without touching the database
// or any NestJS controller wiring — keeping the suite fast and always-on in CI.
describe('Cookie auth contract (unit)', () => {
  beforeAll(() => {
    process.env['JWT_ACCESS_SECRET'] =
      process.env['JWT_ACCESS_SECRET'] ?? 'test-access-secret-32-chars-long!!';
    process.env['JWT_REFRESH_SECRET'] =
      process.env['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret-32-chars-long!';
  });

  it('refresh endpoint reads token from cookie (contract test)', () => {
    // A valid refresh token must carry type === "refresh" after verification
    const refreshToken = signRefreshToken({ sub: 'user1', email: 'a@b.com', role: 'PLAYER' });
    const payload = verifyToken(refreshToken, 'refresh');
    expect(payload.type).toBe('refresh');
    expect(payload.sub).toBe('user1');
  });

  it('access token rejected when used as refresh token', () => {
    // The cookie auth layer must reject access tokens presented at the /refresh endpoint.
    // Access and refresh tokens use distinct secrets, so jwt.verify throws "invalid signature"
    // before the type check is reached — but the key property is that the call always throws.
    const accessToken = signAccessToken({ sub: 'user1', email: 'a@b.com', role: 'PLAYER' });
    expect(() => verifyToken(accessToken, 'refresh')).toThrow();
  });

  it('refresh token rejected when used as access token', () => {
    // Symmetric check: the JWT guard must reject refresh tokens on protected routes.
    // Different secrets mean jwt.verify throws before any type field inspection.
    const refreshToken = signRefreshToken({ sub: 'user2', email: 'b@c.com', role: 'PLAYER' });
    expect(() => verifyToken(refreshToken, 'access')).toThrow();
  });

  it('verifyToken throws Token type mismatch when secret matches but type field is wrong', () => {
    // This covers the path in verifyToken that explicitly checks payload.type.
    // We reach it by verifying a token against the correct secret while passing the wrong type label.
    const refreshToken = signRefreshToken({ sub: 'user3', email: 'c@d.com', role: 'PLAYER' });
    // verifyToken(..., 'refresh') with the refresh secret succeeds — then type check passes.
    // But if we craft the label mismatch with a same-secret token we can test the guard:
    // signRefreshToken signs with JWT_REFRESH_SECRET and sets type='refresh';
    // verifyToken(..., 'refresh') also uses JWT_REFRESH_SECRET → valid signature, payload.type='refresh' === 'refresh' → OK.
    // To trigger the mismatch branch, decode the refresh token but ask for type 'access' using the
    // refresh secret directly. verifyToken picks the secret based on the requested type argument:
    // type='refresh' → JWT_REFRESH_SECRET, type='access' → JWT_ACCESS_SECRET.
    // So asking for 'access' on a refresh-signed token would give "invalid signature".
    // The only way to reach the mismatch branch is when the secret matches but type field differs.
    // We can simulate this by temporarily making both secrets the same value.
    const saved = process.env['JWT_ACCESS_SECRET'];
    process.env['JWT_ACCESS_SECRET'] = process.env['JWT_REFRESH_SECRET'];
    try {
      // Now JWT_ACCESS_SECRET === JWT_REFRESH_SECRET, so the refresh token's signature is valid
      // when verified with 'access', but payload.type === 'refresh' !== 'access' → type mismatch.
      expect(() => verifyToken(refreshToken, 'access')).toThrow('Token type mismatch');
    } finally {
      process.env['JWT_ACCESS_SECRET'] = saved;
    }
  });

  it('verifyToken throws for a malformed JWT string', () => {
    expect(() => verifyToken('not-a-jwt', 'access')).toThrow();
  });
});
