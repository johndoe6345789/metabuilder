/**
 * Tests for useTranslation hook
 */

import { renderHook, act } from '@testing-library/react';

// Mock the translations package
jest.mock('@metabuilder/translations', () => ({
  translations: {
    en: { common: { hello: 'Hello', greeting: 'Hello, {{name}}!' } },
    es: { common: { hello: 'Hola' } },
  },
  defaultLocale: 'en',
  isValidLocale: (l: string) => ['en', 'es'].includes(l),
  supportedLocales: ['en', 'es'],
  localeNames: { en: 'English', es: 'Spanish' },
}));

jest.mock('../hooks/i18nUtils', () => ({
  detectLocale: jest.fn(() => 'en'),
  buildTranslator: jest.fn(
    (translations: Record<string, unknown>) =>
      (key: string, vars?: Record<string, string | number>) => {
        const parts = key.split('.');
        let cur: any = translations;
        for (const p of parts) cur = cur?.[p];
        if (typeof cur === 'string') {
          if (vars) {
            return cur.replace(
              /\{\{(\w+)\}\}/g,
              (_, k) => vars[k]?.toString() ?? `{{${k}}}`
            );
          }
          return cur;
        }
        return key;
      }
  ),
}));

import { useTranslation } from '../useTranslation';

describe('useTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the detected locale by default', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.locale).toBe('en');
  });

  it('uses an explicit locale when provided via options', () => {
    const { result } = renderHook(() => useTranslation({ locale: 'es' }));
    expect(result.current.locale).toBe('es');
  });

  it('t() translates a known key', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('common.hello')).toBe('Hello');
  });

  it('t() interpolates variables', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('common.greeting', { name: 'Alice' })).toBe(
      'Hello, Alice!'
    );
  });

  it('t() returns the key for unknown translations', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('missing.key')).toBe('missing.key');
  });

  it('setLocale updates localStorage', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    const { result } = renderHook(() => useTranslation());
    // setLocale also calls window.location.reload() — swallow that navigation
    // JSDOM fires an error for actual navigation; suppress it
    const origAssign = window.location.assign;
    try {
      act(() => {
        // Call directly; if it throws due to jsdom navigation, catch it
        try {
          result.current.setLocale('es');
        } catch {
          // ignore jsdom navigation error
        }
      });
    } catch {
      // ignore outer
    }

    expect(setItem).toHaveBeenCalledWith('locale', 'es');
    setItem.mockRestore();
  });

  it('returns a translations object', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.translations).toBeDefined();
  });
});
