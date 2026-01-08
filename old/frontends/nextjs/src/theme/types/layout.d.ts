/**
 * Custom theme properties for layout and design tokens
 * These types are used by fakemui's theming system
 */

export interface CustomFonts {
  body: string
  heading: string
  mono: string
}

export interface CustomBorderRadius {
  none: number
  sm: number
  md: number
  lg: number
  xl: number
  full: number
}

export interface CustomContentWidth {
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface CustomSidebar {
  width: number
  collapsedWidth: number
}

export interface CustomHeader {
  height: number
}

export interface CustomThemeProperties {
  fonts: CustomFonts
  borderRadius: CustomBorderRadius
  contentWidth: CustomContentWidth
  sidebar: CustomSidebar
  header: CustomHeader
}

export interface CustomThemeOptions {
  fonts?: Partial<CustomFonts>
  borderRadius?: Partial<CustomBorderRadius>
  contentWidth?: Partial<CustomContentWidth>
  sidebar?: Partial<CustomSidebar>
  header?: Partial<CustomHeader>
}

/**
 * Extended theme interface for fakemui
 */
export interface FakeMuiTheme {
  mode: 'light' | 'dark'
  custom: CustomThemeProperties
}

export interface FakeMuiThemeOptions {
  mode?: 'light' | 'dark'
  custom?: CustomThemeOptions
}
