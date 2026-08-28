export type ThemeColors = Record<string, string>

export interface ThemeEditorState {
  lightColors: ThemeColors
  darkColors: ThemeColors
  activeTab: 'light' | 'dark'
  setActiveTab: (t: 'light' | 'dark') => void
  updateColor: (tab: 'light' | 'dark', key: string, val: string) => void
  applyColors: (colors: ThemeColors) => void
  resetColors: () => void
  saveColors: (light: ThemeColors, dark: ThemeColors) => void
  lightDefaults: ThemeColors
  darkDefaults: ThemeColors
}

export function applyColorsToRoot(colors: ThemeColors): void {
  const root = document.documentElement
  Object.entries(colors).forEach(([k, v]) => {
    root.style.setProperty(k, v)
  })
}

export const LIGHT_DEFAULTS: ThemeColors = {
  '--mat-sys-primary': '#6750a4',
  '--mat-sys-on-primary': '#ffffff',
  '--mat-sys-surface': '#fef7ff',
  '--mat-sys-on-surface': '#1c1b1f',
  '--mat-sys-surface-container': '#f3edf7',
  '--mat-sys-surface-container-high': '#ece6f0',
  '--mat-sys-surface-container-low': '#f7f2fa',
  '--mat-sys-outline': '#79747e',
  '--mat-sys-outline-variant': '#cac4d0',
  '--mat-sys-secondary-container': '#e8def8',
  '--mat-sys-on-secondary-container': '#1d192b',
  '--mat-sys-error': '#b3261e',
  '--mat-sys-on-error': '#ffffff',
}

export const DARK_DEFAULTS: ThemeColors = {
  '--mat-sys-primary': '#d0bcff',
  '--mat-sys-on-primary': '#381e72',
  '--mat-sys-surface': '#141218',
  '--mat-sys-on-surface': '#e6e1e5',
  '--mat-sys-surface-container': '#211f26',
  '--mat-sys-surface-container-high': '#2b2930',
  '--mat-sys-surface-container-low': '#1d1b20',
  '--mat-sys-outline': '#938f99',
  '--mat-sys-outline-variant': '#49454f',
  '--mat-sys-secondary-container': '#4a4458',
  '--mat-sys-on-secondary-container': '#e8def8',
  '--mat-sys-error': '#f2b8b5',
  '--mat-sys-on-error': '#601410',
}
