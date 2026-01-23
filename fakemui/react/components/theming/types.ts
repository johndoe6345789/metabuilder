/**
 * Theme type definitions for fakemui
 */

export interface Theme {
  palette: {
    mode: 'light' | 'dark'
    primary: { main: string; light?: string; dark?: string }
    secondary: { main: string; light?: string; dark?: string }
    background: { default: string; paper: string }
    text: { primary: string; secondary: string }
  }
  typography: {
    fontFamily: string
    fontSize: number
  }
  spacing: (factor: number) => number | string
  breakpoints: {
    values: { xs: number; sm: number; md: number; lg: number; xl: number }
  }
}

export interface ThemeOptions extends Partial<Theme> {}
