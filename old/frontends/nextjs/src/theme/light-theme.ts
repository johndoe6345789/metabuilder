/**
 * Light Theme - CSS Custom Properties
 * 
 * This theme exports CSS variable definitions for the light color scheme.
 * Apply these variables to your root element or use with data-theme="light".
 */

import { colors } from './colors'
import { fonts } from './fonts'
import { layout } from './layout'

/** CSS custom property definitions for light theme */
export const lightTheme = {
  // Mode
  '--theme-mode': 'light',

  // Primary colors
  '--primary-main': colors.primary.light.main,
  '--primary-light': colors.primary.light.light,
  '--primary-dark': colors.primary.light.dark,
  '--primary-contrast-text': colors.primary.light.contrastText,

  // Secondary colors
  '--secondary-main': colors.secondary.light.main,
  '--secondary-light': colors.secondary.light.light,
  '--secondary-dark': colors.secondary.light.dark,
  '--secondary-contrast-text': colors.secondary.light.contrastText,

  // Error colors
  '--error-main': colors.error.light.main,
  '--error-light': colors.error.light.light,
  '--error-dark': colors.error.light.dark,

  // Warning colors
  '--warning-main': colors.warning.light.main,
  '--warning-light': colors.warning.light.light,
  '--warning-dark': colors.warning.light.dark,

  // Info colors
  '--info-main': colors.info.light.main,
  '--info-light': colors.info.light.light,
  '--info-dark': colors.info.light.dark,

  // Success colors
  '--success-main': colors.success.light.main,
  '--success-light': colors.success.light.light,
  '--success-dark': colors.success.light.dark,

  // Neutral colors
  '--neutral-50': colors.neutral[50],
  '--neutral-100': colors.neutral[100],
  '--neutral-200': colors.neutral[200],
  '--neutral-300': colors.neutral[300],
  '--neutral-400': colors.neutral[400],
  '--neutral-500': colors.neutral[500],
  '--neutral-600': colors.neutral[600],
  '--neutral-700': colors.neutral[700],
  '--neutral-800': colors.neutral[800],
  '--neutral-900': colors.neutral[900],
  '--neutral-950': colors.neutral[950],

  // Background
  '--background-default': '#ffffff',
  '--background-paper': colors.neutral[50],

  // Text
  '--text-primary': colors.neutral[900],
  '--text-secondary': colors.neutral[600],
  '--text-disabled': colors.neutral[400],

  // Divider
  '--divider': colors.neutral[200],

  // Action states
  '--action-active': colors.neutral[700],
  '--action-hover': `rgba(113, 113, 122, 0.08)`, // neutral[500] at 8%
  '--action-selected': `rgba(139, 92, 246, 0.12)`, // primary.light.main at 12%
  '--action-disabled': colors.neutral[400],
  '--action-disabled-background': colors.neutral[200],

  // Typography
  '--font-family-body': fonts.body,
  '--font-family-heading': fonts.heading,
  '--font-family-mono': fonts.mono,

  // Layout
  '--spacing-unit': `${layout.spacing}px`,
  '--border-radius': '8px',
  '--border-radius-none': `${layout.borderRadius.none}px`,
  '--border-radius-sm': `${layout.borderRadius.sm}px`,
  '--border-radius-md': `${layout.borderRadius.md}px`,
  '--border-radius-lg': `${layout.borderRadius.lg}px`,
  '--border-radius-xl': `${layout.borderRadius.xl}px`,
  '--border-radius-full': `${layout.borderRadius.full}px`,

  // Content widths
  '--content-width-sm': layout.contentWidth.sm,
  '--content-width-md': layout.contentWidth.md,
  '--content-width-lg': layout.contentWidth.lg,
  '--content-width-xl': layout.contentWidth.xl,
  '--content-width-full': layout.contentWidth.full,

  // Sidebar
  '--sidebar-width': `${layout.sidebar.width}px`,
  '--sidebar-collapsed-width': `${layout.sidebar.collapsedWidth}px`,

  // Header
  '--header-height': `${layout.header.height}px`,

  // Shadows (light theme uses opacity 0.1)
  '--shadow-1': '0 1px 2px rgba(0,0,0,0.05)',
  '--shadow-2': '0 1px 3px rgba(0,0,0,0.1)',
  '--shadow-3': '0 4px 6px rgba(0,0,0,0.1)',
  '--shadow-4': '0 10px 15px rgba(0,0,0,0.1)',
  '--shadow-5': '0 20px 25px rgba(0,0,0,0.1)',
  '--shadow-6': '0 25px 50px rgba(0,0,0,0.25)',
} as const

/** Type for light theme CSS variables */
export type LightThemeVars = typeof lightTheme
