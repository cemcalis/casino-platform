import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './password.service';

describe('password.service', () => {
  describe('hashPassword', () => {
    it('returns a bcrypt hash string starting with $2b$', async () => {
      const hash = await hashPassword('my-secret-password');
      expect(typeof hash).toBe('string');
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('produces a different hash on each call (salted)', async () => {
      const password = 'same-password';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('returns true for a correct password compared to its hash', async () => {
      const password = 'correct-horse-battery-staple';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('returns false for a wrong password', async () => {
      const hash = await hashPassword('the-real-password');
      const result = await comparePassword('the-wrong-password', hash);
      expect(result).toBe(false);
    });

    it('returns false for an empty string against a real hash', async () => {
      const hash = await hashPassword('non-empty-password');
      const result = await comparePassword('', hash);
      expect(result).toBe(false);
    });
  });
});
