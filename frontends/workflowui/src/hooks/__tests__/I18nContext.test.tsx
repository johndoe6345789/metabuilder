/**
 * Tests for I18nProvider and useI18n
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { I18nProvider, useI18n } from '../I18nContext';

jest.mock('@metabuilder/translations', () => ({
  translations: {
    en: { common: { hello: 'Hello' } },
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
      (key: string) => {
        const parts = key.split('.');
        let cur: any = translations;
        for (const p of parts) cur = cur?.[p];
        return typeof cur === 'string' ? cur : key;
      }
  ),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

describe('I18nProvider', () => {
  it('provides locale via useI18n', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.locale).toBe('en');
  });

  it('uses initialLocale prop when provided', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => (
        <I18nProvider initialLocale="es">{children}</I18nProvider>
      ),
    });
    expect(result.current.locale).toBe('es');
  });

  it('t() translates a known key', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('common.hello')).toBe('Hello');
  });

  it('setLocale changes the current locale', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    const { result } = renderHook(() => useI18n(), { wrapper });
    act(() => {
      result.current.setLocale('es');
    });
    expect(result.current.locale).toBe('es');
  });

  it('setLocale persists to localStorage', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useI18n(), { wrapper });
    act(() => {
      result.current.setLocale('es');
    });
    expect(setItem).toHaveBeenCalledWith('locale', 'es');
    setItem.mockRestore();
  });

  it('exposes supportedLocales', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.supportedLocales).toContain('en');
    expect(result.current.supportedLocales).toContain('es');
  });

  it('exposes localeNames', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.localeNames).toHaveProperty('en');
  });
});

describe('useI18n outside provider', () => {
  it('throws an error when used outside I18nProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useI18n())).toThrow(
      'useI18n must be used within an I18nProvider'
    );
    spy.mockRestore();
  });
});
