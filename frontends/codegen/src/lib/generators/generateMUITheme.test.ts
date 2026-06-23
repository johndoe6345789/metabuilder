import { describe, expect, it } from 'vitest'
import { generateTheme } from './generateMUITheme'
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

describe('generateTheme', () => {
  it('returns a minimal token set for empty variants', () => {
    const result = generateTheme(baseTheme())
    expect(result).toContain('m3-scss')
    expect(result).toContain('fontFamily')
  })

  it('generates light theme tokens with correct primary color', () => {
    const theme = baseTheme({
      variants: [{ id: 'light', name: 'Light', colors: lightColors }],
    })
    const result = generateTheme(theme)
    expect(result).toContain('"primary": "#1976d2"')
    expect(result).toContain('"fontFamily": "Roboto"')
    expect(result).toContain('"spacing": 8')
    expect(result).toContain('"borderRadius": 4')
  })

  it('includes dark theme tokens when dark variant present', () => {
    const theme = baseTheme({
      variants: [
        { id: 'light', name: 'Light', colors: lightColors },
        { id: 'dark', name: 'Dark', colors: darkColors },
      ],
    })
    const result = generateTheme(theme)
    expect(result).toContain('"dark": {')
    expect(result).toContain('"background": "#121212"')
  })

  it('exports a single theme object when no dark variant exists', () => {
    const theme = baseTheme({
      variants: [{ id: 'light', name: 'Light', colors: lightColors }],
    })
    const result = generateTheme(theme)
    expect(result).toContain('export const theme = {')
    expect(result).not.toContain('"dark":')
  })

  it('falls back to first variant when no light id variant exists', () => {
    const theme = baseTheme({
      variants: [{ id: 'custom', name: 'Custom', colors: lightColors }],
    })
    const result = generateTheme(theme)
    expect(result).toContain('"primary": "#1976d2"')
  })

  it('uses correct font size from medium', () => {
    const theme = baseTheme({
      variants: [{ id: 'light', name: 'Light', colors: lightColors }],
      fontSize: { small: 11, medium: 15, large: 18 },
    })
    const result = generateTheme(theme)
    expect(result).toContain('"fontSize": 15')
  })
})
