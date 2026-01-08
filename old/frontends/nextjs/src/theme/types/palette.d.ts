/**
 * FakeMUI Palette Type Definitions
 * 
 * This file defines the color palette types used by the fakemui theme system.
 * These replace MUI's palette augmentation with standalone types.
 */

/** Neutral color scale (50-950) */
export interface NeutralPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

/** Standard color palette with main, light, dark variants */
export interface ColorPalette {
  main: string
  light: string
  dark: string
  contrastText?: string
}

/** Full theme palette structure */
export interface ThemePalette {
  mode: 'light' | 'dark'
  primary: ColorPalette
  secondary: ColorPalette
  error: ColorPalette
  warning: ColorPalette
  info: ColorPalette
  success: ColorPalette
  neutral: NeutralPalette
  background: {
    default: string
    paper: string
  }
  text: {
    primary: string
    secondary: string
    disabled: string
  }
  divider: string
  action: {
    active: string
    hover: string
    selected: string
    disabled: string
    disabledBackground: string
  }
}

/** CSS variable names for palette colors */
export type PaletteVarName =
  | `--primary-${'main' | 'light' | 'dark' | 'contrast-text'}`
  | `--secondary-${'main' | 'light' | 'dark' | 'contrast-text'}`
  | `--error-${'main' | 'light' | 'dark'}`
  | `--warning-${'main' | 'light' | 'dark'}`
  | `--info-${'main' | 'light' | 'dark'}`
  | `--success-${'main' | 'light' | 'dark'}`
  | `--neutral-${50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950}`
  | `--background-${'default' | 'paper'}`
  | `--text-${'primary' | 'secondary' | 'disabled'}`
  | '--divider'
  | `--action-${'active' | 'hover' | 'selected' | 'disabled' | 'disabled-background'}`
