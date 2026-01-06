/**
 * Theme Module - Central export for all theme functionality
 * 
 * This module provides CSS custom property-based theming for fakemui compatibility.
 * Themes are exported as objects containing CSS variable definitions.
 */

import type { lightTheme } from './light-theme'

export { colors } from './colors'
export { darkTheme, type DarkThemeVars } from './dark-theme'
export { fonts } from './fonts'
export { layout } from './layout'
export { lightTheme, type LightThemeVars } from './light-theme'
export { typography } from './typography'

/** Theme variable keys - union of all CSS custom property names */
export type ThemeVarKey = keyof typeof lightTheme

/** Theme object type */
export type ThemeVars = Record<ThemeVarKey, string>

/**
 * Apply theme CSS variables to an element
 * @param element - The element to apply the theme to (defaults to document.documentElement)
 * @param theme - The theme object containing CSS variable definitions
 */
export const applyTheme = (
  theme: Record<string, string>,
  element: HTMLElement | null = typeof document !== 'undefined' ? document.documentElement : null
): void => {
  if (element === null) return
  Object.entries(theme).forEach(([key, value]) => {
    element.style.setProperty(key, value)
  })
}

/**
 * Generate CSS string from theme variables
 * @param theme - The theme object containing CSS variable definitions
 * @param selector - CSS selector to scope the variables (default: ':root')
 * @returns CSS string with variable definitions
 */
export const themeToCSS = (
  theme: Record<string, string>,
  selector: string = ':root'
): string => {
  const vars = Object.entries(theme)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
  return `${selector} {\n${vars}\n}`
}

/**
 * Get CSS variable reference
 * @param varName - The CSS variable name (with or without --)
 * @param fallback - Optional fallback value
 * @returns CSS var() function string
 */
export const cssVar = (varName: string, fallback?: string): string => {
  const name = varName.startsWith('--') ? varName : `--${varName}`
  return fallback !== undefined && fallback.length > 0 ? `var(${name}, ${fallback})` : `var(${name})`
}

/**
 * Create an alpha/transparent version of a color using CSS color-mix
 * Replacement for MUI's alpha() function
 * @param color - The base color (can be a CSS variable reference)
 * @param opacity - Opacity value between 0 and 1
 * @returns CSS color-mix() function string
 */
export const alpha = (color: string, opacity: number): string => {
  const percentage = Math.round(opacity * 100)
  return `color-mix(in srgb, ${color} ${percentage}%, transparent)`
}
