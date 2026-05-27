import { describe, expect, it } from 'vitest'
import { generateMUITheme } from './generateMUITheme'
import type { ThemeConfig } from '@/types/project'

function baseTheme(overrides: Partial<ThemeConfig> = {}): ThemeConfig {
  return {
    variants: [],
    activeVariantId: 'light',
    fontFamily: 'Roboto',
    fontSize: { small: 12, medium: 14, large: 16 },
    spacing: 8,
    borderRadius: 4,
    ...overrides,
  }
}

const lightColors = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  errorColor: '#f44336',
  warningColor: '#ff9800',
  successColor: '#4caf50',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e0e0e0',
  customColors: {},
}

const darkColors = {
  ...lightColors,
  primaryColor: '#90caf9',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
}

describe('generateMUITheme', () => {
  it('returns a minimal theme for empty variants', () => {
    const result = generateMUITheme(baseTheme())
    expect(result).toContain("createTheme")
    expect(result).toContain("mode: 'light'")
  })

  it('generates lightTheme with correct primary color', () => {
    const theme = baseTheme({
      variants: [{ id: 'light', name: 'Light', colors: lightColors }],
    })
    const result = generateMUITheme(theme)
    expect(result).toContain("main: '#1976d2'")
    expect(result).toContain("fontFamily: 'Roboto'")
    expect(result).toContain('spacing: 8')
    expect(result).toContain('borderRadius: 4')
  })

  it('generates darkTheme export when dark variant present', () => {
    const theme = baseTheme({
      variants: [
        { id: 'light', name: 'Light', colors: lightColors },
        { id: 'dark', name: 'Dark', colors: darkColors },
      ],
    })
    const result = generateMUITheme(theme)
    expect(result).toContain('darkTheme')
    expect(result).toContain("mode: 'dark'")
  })

  it('exports theme = lightTheme when no dark variant', () => {
    const theme = baseTheme({
      variants: [{ id: 'light', name: 'Light', colors: lightColors }],
    })
    const result = generateMUITheme(theme)
    expect(result).toContain('export const theme = lightTheme')
    expect(result).not.toContain('darkTheme')
  })

  it('falls back to first variant when no light id variant exists', () => {
    const theme = baseTheme({
      variants: [{ id: 'custom', name: 'Custom', colors: lightColors }],
    })
    const result = generateMUITheme(theme)
    expect(result).toContain('lightTheme')
    expect(result).toContain("main: '#1976d2'")
  })

  it('uses correct font size from medium', () => {
    const theme = baseTheme({
      variants: [{ id: 'light', name: 'Light', colors: lightColors }],
      fontSize: { small: 11, medium: 15, large: 18 },
    })
    const result = generateMUITheme(theme)
    expect(result).toContain('fontSize: 15')
  })
})
