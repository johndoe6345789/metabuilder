import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyTenantTheme,
  resolveTenantTheme,
} from './apply-tenant-theme'
import { LIGHT_DEFAULTS, DARK_DEFAULTS } from './theme-defaults'

const STORAGE_KEY = 'pg-theme-overrides'

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resolveTenantTheme', () => {
  it('uses DBAL colours when the row exists', async () => {
    mockFetch(async () =>
      ({
        ok: true,
        json: async () => ({
          data: {
            lightColors: JSON.stringify({ '--bg': '#eee' }),
            darkColors: JSON.stringify({ '--bg': '#111' }),
          },
        }),
      }) as Response
    )

    const theme = await resolveTenantTheme()

    expect(theme.light['--bg']).toBe('#eee')
    expect(theme.dark['--bg']).toBe('#111')
    // Merged with defaults, not replacing them entirely.
    expect(theme.light['--mat-sys-primary']).toBe(
      LIGHT_DEFAULTS['--mat-sys-primary']
    )
  })

  it('falls back to localStorage when DBAL has no row', async () => {
    mockFetch(async () => ({ ok: false, status: 404 }) as Response)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ light: { '--bg': '#abc' } })
    )

    const theme = await resolveTenantTheme()

    expect(theme.light['--bg']).toBe('#abc')
    expect(theme.dark).toEqual(DARK_DEFAULTS)
  })

  it('falls back to localStorage when the DBAL row is missing colour fields', async () => {
    mockFetch(async () =>
      ({ ok: true, json: async () => ({ data: {} }) }) as Response
    )
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ dark: { '--bg': '#222' } })
    )

    const theme = await resolveTenantTheme()

    expect(theme.dark['--bg']).toBe('#222')
  })

  it('falls back to localStorage when the fetch throws', async () => {
    mockFetch(async () => {
      throw new Error('network down')
    })
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ light: { '--bg': '#fed' } })
    )

    const theme = await resolveTenantTheme()

    expect(theme.light['--bg']).toBe('#fed')
  })

  it('falls back to built-in defaults when neither DBAL nor localStorage has anything', async () => {
    mockFetch(async () => ({ ok: false, status: 404 }) as Response)

    const theme = await resolveTenantTheme()

    expect(theme).toEqual({ light: LIGHT_DEFAULTS, dark: DARK_DEFAULTS })
  })

  it('ignores malformed JSON in localStorage and falls back to defaults', async () => {
    mockFetch(async () => ({ ok: false, status: 404 }) as Response)
    localStorage.setItem(STORAGE_KEY, '{not json')

    const theme = await resolveTenantTheme()

    expect(theme).toEqual({ light: LIGHT_DEFAULTS, dark: DARK_DEFAULTS })
  })
})

describe('applyTenantTheme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style')
  })

  it('applies the light half in light mode', () => {
    applyTenantTheme(
      { light: { '--bg': '#fff' }, dark: { '--bg': '#000' } },
      'light'
    )
    expect(document.documentElement.style.getPropertyValue('--bg')).toBe(
      '#fff'
    )
  })

  it('applies the dark half in dark mode', () => {
    applyTenantTheme(
      { light: { '--bg': '#fff' }, dark: { '--bg': '#000' } },
      'dark'
    )
    expect(document.documentElement.style.getPropertyValue('--bg')).toBe(
      '#000'
    )
  })
})
