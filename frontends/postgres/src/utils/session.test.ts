import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock next/headers before importing session
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock jose
vi.mock('jose', async () => {
  class MockSignJWT {
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return 'mock.jwt.token'; }
  }
  return {
    jwtVerify: vi.fn(),
    SignJWT: MockSignJWT,
  };
});

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { createSession, setSessionCookie, getSession, clearSession } from './session';

const mockCookies = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

describe('session utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('JWT_SECRET', 'test-secret-key-that-is-long-enough');
    vi.mocked(cookies).mockResolvedValue(mockCookies as any);
  });

  describe('createSession', () => {
    it('should return a JWT token string', async () => {
      const token = await createSession({ userId: 1, username: 'admin' });
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('setSessionCookie', () => {
    it('should set the session cookie', async () => {
      await setSessionCookie('mock.jwt.token');
      expect(mockCookies.set).toHaveBeenCalledWith(
        'admin-session',
        'mock.jwt.token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });
  });

  describe('getSession', () => {
    it('should return null when no cookie is present', async () => {
      mockCookies.get.mockReturnValue(undefined);
      const session = await getSession();
      expect(session).toBeNull();
    });

    it('should return session data when cookie is valid', async () => {
      const mockPayload = { userId: 1, username: 'admin' };
      mockCookies.get.mockReturnValue({ value: 'valid.jwt.token' });
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'HS256' },
      } as any);
      const session = await getSession();
      expect(session).toEqual(mockPayload);
    });

    it('should return null when JWT verification fails', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid.token' });
      vi.mocked(jwtVerify).mockRejectedValue(new Error('Invalid token'));
      const session = await getSession();
      expect(session).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should delete the session cookie', async () => {
      await clearSession();
      expect(mockCookies.delete).toHaveBeenCalledWith('admin-session');
    });
  });
});
