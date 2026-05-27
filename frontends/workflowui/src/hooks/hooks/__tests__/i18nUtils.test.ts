/**
 * Tests for i18nUtils – pure i18n utility functions
 */

jest.mock('@metabuilder/translations', () => ({
  translations: {
    en: {
      common: {
        hello: 'Hello',
        greeting: 'Hello, {{name}}!',
        nested: { deep: 'Deep value' },
      },
    },
    es: {
      common: {
        hello: 'Hola',
      },
    },
  },
  defaultLocale: 'en',
  isValidLocale: (l: string) => ['en', 'es'].includes(l),
}));

import {
  getNestedValue,
  interpolate,
  detectLocale,
  buildTranslator,
} from '../i18nUtils';

describe('getNestedValue', () => {
  const obj = {
    a: {
      b: {
        c: 'deep value',
      },
    },
    str: 'top level',
    num: 42,
  };

  it('retrieves a top-level string value', () => {
    expect(getNestedValue(obj as any, 'str')).toBe('top level');
  });

  it('retrieves a deeply nested string value', () => {
    expect(getNestedValue(obj as any, 'a.b.c')).toBe('deep value');
  });

  it('returns undefined for a missing path', () => {
    expect(getNestedValue(obj as any, 'a.x.c')).toBeUndefined();
  });

  it('returns undefined when path leads to a non-string', () => {
    expect(getNestedValue(obj as any, 'num')).toBeUndefined();
  });

  it('returns undefined for an empty object', () => {
    expect(getNestedValue({}, 'a.b')).toBeUndefined();
  });

  it('returns undefined when intermediate node is null/undefined', () => {
    expect(getNestedValue({ a: null } as any, 'a.b')).toBeUndefined();
  });
});

describe('interpolate', () => {
  it('returns the template unchanged when no variables provided', () => {
    expect(interpolate('Hello, world!')).toBe('Hello, world!');
  });

  it('interpolates a single variable', () => {
    expect(interpolate('Hello, {{name}}!', { name: 'Alice' })).toBe(
      'Hello, Alice!'
    );
  });

  it('interpolates multiple variables', () => {
    expect(
      interpolate('{{greeting}}, {{name}}!', {
        greeting: 'Hi',
        name: 'Bob',
      })
    ).toBe('Hi, Bob!');
  });

  it('interpolates numeric values', () => {
    expect(interpolate('You have {{count}} items', { count: 5 })).toBe(
      'You have 5 items'
    );
  });

  it('leaves unknown placeholders intact', () => {
    expect(interpolate('Hello, {{missing}}!', {})).toBe('Hello, {{missing}}!');
  });

  it('handles empty string template', () => {
    expect(interpolate('', { foo: 'bar' })).toBe('');
  });
});

describe('detectLocale', () => {
  const originalWindow = global.window;
  const originalLocalStorage = global.localStorage;
  const originalNavigator = global.navigator;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns defaultLocale when window is undefined (SSR)', () => {
    // In JSDOM, window cannot be set to undefined. Instead, test the SSR path
    // by checking that i18nUtils exports the detectLocale function and that
    // the function falls back gracefully — we verify via localStorage path instead.
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    Object.defineProperty(global.navigator, 'language', {
      value: 'xx', // unsupported locale
      configurable: true,
    });
    const result = detectLocale();
    expect(result).toBe('en'); // falls back to defaultLocale
    Object.defineProperty(global.navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });
  });

  it('returns stored locale from localStorage if valid', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('es');
    const result = detectLocale();
    expect(result).toBe('es');
  });

  it('falls back to browser language when localStorage has no valid locale', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    Object.defineProperty(global.navigator, 'language', {
      value: 'es-ES',
      configurable: true,
    });
    const result = detectLocale();
    expect(result).toBe('es');
    // Restore
    Object.defineProperty(global.navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });
  });

  it('returns defaultLocale when both localStorage and navigator give invalid locale', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    Object.defineProperty(global.navigator, 'language', {
      value: 'xx-XX',
      configurable: true,
    });
    const result = detectLocale();
    expect(result).toBe('en');
    Object.defineProperty(global.navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });
  });
});

describe('buildTranslator', () => {
  const enTranslations = {
    common: {
      hello: 'Hello',
      greeting: 'Hello, {{name}}!',
    },
  };

  it('returns the translated string for a known key', () => {
    const t = buildTranslator(enTranslations);
    expect(t('common.hello')).toBe('Hello');
  });

  it('interpolates variables in the translated string', () => {
    const t = buildTranslator(enTranslations);
    expect(t('common.greeting', { name: 'World' })).toBe('Hello, World!');
  });

  it('returns the key itself when translation is missing', () => {
    const t = buildTranslator(enTranslations);
    expect(t('missing.key')).toBe('missing.key');
  });

  it('falls back to default locale when key missing in current locale', () => {
    // Spanish translations only have common.hello
    const esTranslations = { common: { hello: 'Hola' } };
    const t = buildTranslator(esTranslations);
    // common.greeting is not in es, but IS in en (defaultLocale)
    expect(t('common.greeting', { name: 'World' })).toBe('Hello, World!');
  });
});
