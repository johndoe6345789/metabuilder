 'use client'

import { useSyncExternalStore } from 'react'

export type ThemeBreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

const baseTheme = {
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#6750a4',
    },
    secondary: {
      main: '#625b71',
    },
    error: {
      main: '#b3261e',
    },
    background: {
      default: '#ffffff',
      paper: '#f3edf7',
    },
    text: {
      primary: '#1d1b20',
      secondary: '#49454f',
      disabled: 'rgba(29, 27, 32, 0.38)',
    },
    divider: '#cac4d0',
  },
  typography: {
    fontFamily: 'Roboto, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
  },
  spacing: (factor: number) => `${factor * 8}px`,
  breakpoints: {
    values: breakpoints,
    up: (key: ThemeBreakpointKey | number) => {
      const width = typeof key === 'number' ? key : breakpoints[key]
      return `(min-width: ${width}px)`
    },
  },
  zIndex: {
    drawer: 1200,
  },
}

function readCssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') {
    return fallback
  }

  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function getMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return baseTheme.palette.mode
  }

  const html = document.documentElement
  const body = document.body
  const explicitMode = html.getAttribute('data-theme') || body?.getAttribute('data-theme')

  if (explicitMode === 'light' || explicitMode === 'dark') {
    return explicitMode
  }

  if (html.classList.contains('dark') || body?.classList.contains('dark')) {
    return 'dark'
  }

  if (html.classList.contains('light') || body?.classList.contains('light')) {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function parseFontSize(fallback: number) {
  const raw = readCssVar('--mat-sys-body-medium-size', `${fallback}px`)
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getThemeSnapshot() {
  const mode = getMode()

  return {
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode,
      primary: {
        main: readCssVar('--mat-sys-primary', baseTheme.palette.primary.main),
      },
      secondary: {
        main: readCssVar('--mat-sys-secondary', baseTheme.palette.secondary.main),
      },
      error: {
        main: readCssVar('--mat-sys-error', baseTheme.palette.error.main),
      },
      background: {
        default: readCssVar('--mat-sys-surface', baseTheme.palette.background.default),
        paper: readCssVar('--mat-sys-surface-container', baseTheme.palette.background.paper),
      },
      text: {
        primary: readCssVar('--mat-sys-on-surface', baseTheme.palette.text.primary),
        secondary: readCssVar('--mat-sys-on-surface-variant', baseTheme.palette.text.secondary),
        disabled: readCssVar('--color-text-disabled', baseTheme.palette.text.disabled),
      },
      divider: readCssVar('--mat-sys-outline-variant', baseTheme.palette.divider),
    },
    typography: {
      ...baseTheme.typography,
      fontSize: parseFontSize(baseTheme.typography.fontSize),
    },
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const observer = new MutationObserver(() => callback())

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'style'],
  })

  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    })
  }

  mediaQuery.addEventListener('change', callback)

  return () => {
    observer.disconnect()
    mediaQuery.removeEventListener('change', callback)
  }
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getThemeSnapshot, () => baseTheme)
}

export default useTheme
