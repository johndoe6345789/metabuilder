/**
 * JSON schema types for the theming system
 * All themes can be defined and customized via JSON
 */

export interface ThemeSchema {
  id: string
  name: string
  sidebar: SidebarTheme
  colors: ColorTheme
  spacing: SpacingTheme
  typography: TypographyTheme
}

export interface SidebarTheme {
  width: string
  widthMobile: string
  widthIcon: string
  backgroundColor: string
  foregroundColor: string
  borderColor: string
  accentColor: string
  accentForeground: string
  hoverBackground: string
  activeBackground: string
  headerHeight: string
  transitionDuration: string
  zIndex: number
}

export interface ColorTheme {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  customColors?: Record<string, string>
}

export interface SpacingTheme {
  radius: string
  unit?: number
  scale?: number[]
}

export interface TypographyTheme {
  fontFamily: {
    body: string
    heading: string
    code: string
  }
  fontSize?: Record<string, string>
  fontWeight?: Record<string, number>
}

/**
 * Theme variant for multi-theme support
 */
export interface ThemeVariant {
  id: string
  name: string
  colors: ColorTheme
}

/**
 * Application theme configuration (stored in KV)
 */
export interface AppThemeConfig {
  activeVariantId: string
  variants: ThemeVariant[]
  typography: {
    headingFont: string
    bodyFont: string
    codeFont: string
  }
}
