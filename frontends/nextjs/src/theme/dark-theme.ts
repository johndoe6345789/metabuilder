/**
 * Dark Theme - CSS Custom Properties
 * 
 * This theme exports CSS variable definitions for the dark color scheme.
 * Apply these variables to your root element or use with data-theme="dark".
 */

import { colors } from './colors'
import { fonts } from './fonts'
import { layout } from './layout'

/** CSS custom property definitions for dark theme */
export const darkTheme = {
  // Mode
  '--theme-mode': 'dark',

  // Primary colors
  '--primary-main': colors.primary.dark.main,
  '--primary-light': colors.primary.dark.light,
  '--primary-dark': colors.primary.dark.dark,
  '--primary-contrast-text': colors.primary.dark.contrastText,

  // Secondary colors
  '--secondary-main': colors.secondary.dark.main,
  '--secondary-light': colors.secondary.dark.light,
  '--secondary-dark': colors.secondary.dark.dark,
  '--secondary-contrast-text': colors.secondary.dark.contrastText,

  // Error colors
  '--error-main': colors.error.dark.main,
  '--error-light': colors.error.dark.light,
  '--error-dark': colors.error.dark.dark,

  // Warning colors
  '--warning-main': colors.warning.dark.main,
  '--warning-light': colors.warning.dark.light,
  '--warning-dark': colors.warning.dark.dark,

  // Info colors
  '--info-main': colors.info.dark.main,
  '--info-light': colors.info.dark.light,
  '--info-dark': colors.info.dark.dark,

  // Success colors
  '--success-main': colors.success.dark.main,
  '--success-light': colors.success.dark.light,
  '--success-dark': colors.success.dark.dark,

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
  '--background-default': colors.neutral[950],
  '--background-paper': colors.neutral[900],

  // Text
  '--text-primary': colors.neutral[100],
  '--text-secondary': colors.neutral[400],
  '--text-disabled': colors.neutral[600],

  // Divider
  '--divider': colors.neutral[800],

  // Action states
  '--action-active': colors.neutral[300],
  '--action-hover': `rgba(161, 161, 170, 0.12)`, // neutral[400] at 12%
  '--action-selected': `rgba(167, 139, 250, 0.2)`, // primary.dark.main at 20%
  '--action-disabled': colors.neutral[600],
  '--action-disabled-background': colors.neutral[800],

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

  // Shadows (dark theme uses opacity 0.4)
  '--shadow-1': '0 1px 2px rgba(0,0,0,0.2)',
  '--shadow-2': '0 1px 3px rgba(0,0,0,0.4)',
  '--shadow-3': '0 4px 6px rgba(0,0,0,0.4)',
  '--shadow-4': '0 10px 15px rgba(0,0,0,0.4)',
  '--shadow-5': '0 20px 25px rgba(0,0,0,0.4)',
  '--shadow-6': '0 25px 50px rgba(0,0,0,1)',
} as const

/** Type for dark theme CSS variables */
export type DarkThemeVars = typeof darkTheme
