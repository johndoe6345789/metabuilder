/**
 * Tests for auth middleware - route protection logic
 */

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url: URL) => ({ type: 'redirect', url })),
    next: jest.fn(() => ({ type: 'next' })),
  },
}));

import { NextResponse } from 'next/server';
import { middleware } from '../auth';

const mockRedirect = NextResponse.redirect as jest.Mock;
const mockNext = NextResponse.next as jest.Mock;

function makeRequest(pathname: string, hasToken = false) {
  const cookies = {
    get: jest.fn((key: string) =>
      key === 'auth_token' && hasToken ? { value: 'valid-token' } : undefined
    ),
  };

  return {
    nextUrl: {
      pathname,
      clone: () => new URL('http://localhost' + pathname),
    },
    url: 'http://localhost' + pathname,
    cookies,
  } as any;
}

describe('auth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('public routes', () => {
    it('allows unauthenticated access to /', () => {
      const req = makeRequest('/', false);
      middleware(req);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows authenticated access to /', () => {
      const req = makeRequest('/', true);
      middleware(req);
      // / is not an auth-only route so no redirect
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('protected routes', () => {
    it('redirects unauthenticated user from /workspace to /login', () => {
      const req = makeRequest('/workspace', false);
      middleware(req);
      expect(mockRedirect).toHaveBeenCalled();
      const callArg = mockRedirect.mock.calls[0][0] as URL;
      expect(callArg.pathname).toBe('/login');
    });

    it('redirects unauthenticated user from /project to /login', () => {
      const req = makeRequest('/project', false);
      middleware(req);
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('redirects unauthenticated user from /editor to /login', () => {
      const req = makeRequest('/editor', false);
      middleware(req);
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('allows authenticated user to access /workspace', () => {
      const req = makeRequest('/workspace', true);
      middleware(req);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows authenticated user to access /workspace/123', () => {
      const req = makeRequest('/workspace/123', true);
      middleware(req);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('auth-only routes', () => {
    it('redirects authenticated user away from /login', () => {
      const req = makeRequest('/login', true);
      middleware(req);
      expect(mockRedirect).toHaveBeenCalled();
      const callArg = mockRedirect.mock.calls[0][0] as URL;
      expect(callArg.pathname).toBe('/');
    });

    it('redirects authenticated user away from /register', () => {
      const req = makeRequest('/register', true);
      middleware(req);
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('allows unauthenticated user to access /login', () => {
      const req = makeRequest('/login', false);
      middleware(req);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows unauthenticated user to access /register', () => {
      const req = makeRequest('/register', false);
      middleware(req);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
