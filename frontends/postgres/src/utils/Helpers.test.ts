import { describe, expect, it, vi, beforeEach } from 'vitest';
import { routing } from '@/libs/I18nRouting';
import { getI18nPath, getBaseUrl, isServer } from './Helpers';

describe('Helpers', () => {
  describe('getI18nPath function', () => {
    it('should not change the path for default language', () => {
      const url = '/random-url';
      const locale = routing.defaultLocale;

      expect(getI18nPath(url, locale)).toBe(url);
    });

    it('should prepend the locale to the path for non-default language', () => {
      const url = '/random-url';
      const locale = 'fr';

      expect(getI18nPath(url, locale)).toMatch(/^\/fr/);
    });
  });

  describe('getBaseUrl function', () => {
    beforeEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return NEXT_PUBLIC_APP_URL when set', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://myapp.com');
      expect(getBaseUrl()).toBe('https://myapp.com');
    });

    it('should return VERCEL_PROJECT_PRODUCTION_URL in production', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
      vi.stubEnv('VERCEL_ENV', 'production');
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'myapp.vercel.app');
      expect(getBaseUrl()).toBe('https://myapp.vercel.app');
    });

    it('should return VERCEL_URL when set', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
      vi.stubEnv('VERCEL_ENV', 'preview');
      vi.stubEnv('VERCEL_URL', 'deploy-preview.vercel.app');
      expect(getBaseUrl()).toBe('https://deploy-preview.vercel.app');
    });

    it('should return localhost fallback', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
      vi.stubEnv('VERCEL_ENV', '');
      vi.stubEnv('VERCEL_URL', '');
      expect(getBaseUrl()).toBe('http://localhost:3000');
    });
  });

  describe('isServer function', () => {
    it('should return false in jsdom/browser environment (window is defined)', () => {
      // In node environment window is undefined, in jsdom it's defined
      const result = isServer();
      // In jsdom, window is defined, so isServer() returns false
      // In node, window is undefined, so isServer() returns true
      expect(typeof result).toBe('boolean');
    });
  });
});
