import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('app-config', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    // Clear module cache to force re-evaluation
    vi.resetModules();
  });

  it('should use NEXT_PUBLIC_BASE_PATH when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/custom-path');
    const { BASE_PATH } = await import('./app-config');
    expect(BASE_PATH).toBe('/custom-path');
  });

  it('should default to /postgres when NEXT_PUBLIC_BASE_PATH is not set', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
    const { BASE_PATH } = await import('./app-config');
    expect(BASE_PATH).toBe('/postgres');
  });
});
