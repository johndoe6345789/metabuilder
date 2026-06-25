/**
 * Tests for lib/app-config.ts
 */

describe('app-config', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('uses the default base path when env var is not set', async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    const { BASE_PATH } = await import('../app-config');
    expect(BASE_PATH).toBe('/workflowui');
  });

  it('uses NEXT_PUBLIC_BASE_PATH when set', async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/custom';
    const { BASE_PATH } = await import('../app-config');
    expect(BASE_PATH).toBe('/custom');
  });
});
