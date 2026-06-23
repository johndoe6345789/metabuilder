export type ThemeBreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

const theme = {
  palette: {
    mode: 'light' as const,
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: 'Roboto, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
  },
  spacing: (factor: number) => `${factor * 8}px`,
  breakpoints: {
    values: breakpoints,
    up: (key: ThemeBreakpointKey | number) => {
      const width = typeof key === 'number' ? key : breakpoints[key]
      return `(min-width: ${width}px)`
    },
  },
  zIndex: {
    drawer: 1200,
  },
}

export function useTheme() {
  return theme
}

export default useTheme
