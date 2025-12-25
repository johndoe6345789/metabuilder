'use client'

import { createTheme, ThemeOptions, alpha, Theme } from '@mui/material/styles'
import './theme.d.ts' // Import type extensions

// ========================================
// Design Tokens - Unified color system
// ========================================

// Primary colors - Purple/Magenta accent
const colors = {
  primary: {
    light: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    dark: {
      main: '#a78bfa',
      light: '#c4b5fd',
      dark: '#8b5cf6',
      contrastText: '#ffffff',
    },
  },
  secondary: {
    light: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    dark: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#f59e0b',
      contrastText: '#000000',
    },
  },
  error: {
    light: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    dark: { main: '#f87171', light: '#fca5a5', dark: '#ef4444' },
  },
  warning: {
    light: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    dark: { main: '#fbbf24', light: '#fcd34d', dark: '#f59e0b' },
  },
  info: {
    light: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2' },
    dark: { main: '#22d3ee', light: '#67e8f9', dark: '#06b6d4' },
  },
  success: {
    light: { main: '#10b981', light: '#34d399', dark: '#059669' },
    dark: { main: '#34d399', light: '#6ee7b7', dark: '#10b981' },
  },
  // Neutral grays
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
}

// ========================================
// Typography System
// ========================================

const fontFamilyBody = [
  'IBM Plex Sans',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Arial',
  'sans-serif',
].join(',')

const fontFamilyHeading = ['Space Grotesk', 'IBM Plex Sans', 'sans-serif'].join(',')
const fontFamilyMono = ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'].join(',')

const typography = {
  fontFamily: fontFamilyBody,
  h1: {
    fontFamily: fontFamilyHeading,
    fontWeight: 700,
    fontSize: '3rem', // 48px
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: fontFamilyHeading,
    fontWeight: 700,
    fontSize: '2.25rem', // 36px
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontFamily: fontFamilyHeading,
    fontWeight: 600,
    fontSize: '1.875rem', // 30px
    lineHeight: 1.3,
  },
  h4: {
    fontFamily: fontFamilyHeading,
    fontWeight: 600,
    fontSize: '1.5rem', // 24px
    lineHeight: 1.35,
  },
  h5: {
    fontFamily: fontFamilyHeading,
    fontWeight: 600,
    fontSize: '1.25rem', // 20px
    lineHeight: 1.4,
  },
  h6: {
    fontFamily: fontFamilyHeading,
    fontWeight: 600,
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
  },
  subtitle1: {
    fontFamily: fontFamilyBody,
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  subtitle2: {
    fontFamily: fontFamilyBody,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  body1: {
    fontFamily: fontFamilyBody,
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontFamily: fontFamilyBody,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  caption: {
    fontFamily: fontFamilyBody,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
  overline: {
    fontFamily: fontFamilyBody,
    fontWeight: 600,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: fontFamilyBody,
    fontWeight: 500,
    fontSize: '0.875rem',
    textTransform: 'none' as const,
    letterSpacing: '0.01em',
  },
}

// ========================================
// Spacing & Shape
// ========================================

const spacing = 8 // Base 8px grid

const shape = {
  borderRadius: 8,
}

// ========================================
// Shadows System
// ========================================

const lightShadows = [
  'none',
  '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  // Remaining slots (7-24) - using progressive shadows
  ...Array(18).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)'),
] as ThemeOptions['shadows']

const darkShadows = [
  'none',
  '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
  '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  ...Array(18).fill('0 25px 50px -12px rgba(0, 0, 0, 0.5)'),
] as ThemeOptions['shadows']

// ========================================
// Z-Index Scale
// ========================================

const zIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
}

// ========================================
// Transitions
// ========================================

const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
}

// ========================================
// Component Overrides
// ========================================

const getComponentOverrides = (mode: 'light' | 'dark'): ThemeOptions['components'] => {
  const isDark = mode === 'dark'
  const neutral = colors.neutral

  return {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--font-family-body': fontFamilyBody,
          '--font-family-heading': fontFamilyHeading,
          '--font-family-mono': fontFamilyMono,
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        'code, pre, kbd': {
          fontFamily: fontFamilyMono,
        },
        '::selection': {
          backgroundColor: isDark ? colors.primary.dark.main : colors.primary.light.main,
          color: '#ffffff',
        },
        // Custom scrollbar
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: isDark ? neutral[800] : neutral[100],
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: isDark ? neutral[600] : neutral[400],
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: isDark ? neutral[500] : neutral[500],
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 200ms ease-in-out',
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: `0 4px 12px ${alpha(isDark ? colors.primary.dark.main : colors.primary.light.main, 0.4)}`,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${isDark ? neutral[800] : neutral[200]}`,
          backgroundImage: 'none',
          transition: 'box-shadow 200ms ease-in-out, border-color 200ms ease-in-out',
          '&:hover': {
            boxShadow: isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px 16px',
        },
        title: {
          fontFamily: fontFamilyHeading,
          fontWeight: 600,
          fontSize: '1.125rem',
        },
        subheader: {
          fontSize: '0.875rem',
          color: isDark ? neutral[400] : neutral[600],
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          borderTop: `1px solid ${isDark ? neutral[800] : neutral[200]}`,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: isDark ? neutral[800] : neutral[200],
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: isDark ? neutral[900] : '#ffffff',
            transition: 'border-color 200ms ease-in-out, box-shadow 200ms ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? neutral[600] : neutral[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? neutral[700] : neutral[300],
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        sizeSmall: {
          height: 24,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          alignItems: 'center',
        },
        standardSuccess: {
          backgroundColor: isDark ? alpha(colors.success.dark.main, 0.15) : alpha(colors.success.light.main, 0.1),
          color: isDark ? colors.success.dark.light : colors.success.light.dark,
        },
        standardError: {
          backgroundColor: isDark ? alpha(colors.error.dark.main, 0.15) : alpha(colors.error.light.main, 0.1),
          color: isDark ? colors.error.dark.light : colors.error.light.dark,
        },
        standardWarning: {
          backgroundColor: isDark ? alpha(colors.warning.dark.main, 0.15) : alpha(colors.warning.light.main, 0.1),
          color: isDark ? colors.warning.dark.dark : colors.warning.light.dark,
        },
        standardInfo: {
          backgroundColor: isDark ? alpha(colors.info.dark.main, 0.15) : alpha(colors.info.light.main, 0.1),
          color: isDark ? colors.info.dark.light : colors.info.light.dark,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: fontFamilyHeading,
          fontWeight: 600,
          fontSize: '1.25rem',
          padding: '24px 24px 16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 8,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            backgroundColor: isDark ? neutral[900] : neutral[50],
            borderBottom: `2px solid ${isDark ? neutral[700] : neutral[300]}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${isDark ? neutral[800] : neutral[200]}`,
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: isDark ? alpha(neutral[700], 0.3) : alpha(neutral[100], 0.5),
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 48,
          padding: '12px 16px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? neutral[700] : neutral[900],
          color: isDark ? neutral[100] : '#ffffff',
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: 6,
        },
        arrow: {
          color: isDark ? neutral[700] : neutral[900],
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: isDark 
            ? '0 10px 40px rgba(0, 0, 0, 0.5)' 
            : '0 10px 40px rgba(0, 0, 0, 0.15)',
          border: `1px solid ${isDark ? neutral[800] : neutral[200]}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          borderRadius: 4,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: isDark ? neutral[800] : neutral[100],
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${isDark ? neutral[800] : neutral[200]}`,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: isDark ? neutral[900] : '#ffffff',
          borderBottom: `1px solid ${isDark ? neutral[800] : neutral[200]}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDark ? neutral[800] : neutral[200],
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: fontFamilyHeading,
          fontWeight: 600,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: '0.6875rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          strokeLinecap: 'round',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: isDark ? neutral[800] : neutral[200],
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: `1px solid ${isDark ? neutral[800] : neutral[200]}`,
          borderRadius: 8,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0 16px',
          minHeight: 56,
          '&.Mui-expanded': {
            minHeight: 56,
          },
        },
        content: {
          fontWeight: 500,
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 16px 16px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 46,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
          },
        },
        thumb: {
          width: 22,
          height: 22,
        },
        track: {
          borderRadius: 13,
          opacity: 1,
          backgroundColor: isDark ? neutral[700] : neutral[300],
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color 200ms ease-in-out',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '8px 12px',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            borderRadius: 8,
          },
        },
      },
    },
  }
}

// ========================================
// Create Themes
// ========================================

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary.light,
    secondary: colors.secondary.light,
    error: colors.error.light,
    warning: colors.warning.light,
    info: colors.info.light,
    success: colors.success.light,
    background: {
      default: '#ffffff',
      paper: colors.neutral[50],
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      disabled: colors.neutral[400],
    },
    divider: colors.neutral[200],
    action: {
      active: colors.neutral[700],
      hover: alpha(colors.neutral[500], 0.08),
      selected: alpha(colors.primary.light.main, 0.12),
      disabled: colors.neutral[400],
      disabledBackground: colors.neutral[200],
    },
  },
  typography,
  spacing,
  shape,
  shadows: lightShadows,
  zIndex,
  transitions,
  components: getComponentOverrides('light'),
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary.dark,
    secondary: colors.secondary.dark,
    error: colors.error.dark,
    warning: colors.warning.dark,
    info: colors.info.dark,
    success: colors.success.dark,
    background: {
      default: colors.neutral[950],
      paper: colors.neutral[900],
    },
    text: {
      primary: colors.neutral[100],
      secondary: colors.neutral[400],
      disabled: colors.neutral[600],
    },
    divider: colors.neutral[800],
    action: {
      active: colors.neutral[300],
      hover: alpha(colors.neutral[400], 0.12),
      selected: alpha(colors.primary.dark.main, 0.2),
      disabled: colors.neutral[600],
      disabledBackground: colors.neutral[800],
    },
  },
  typography,
  spacing,
  shape,
  shadows: darkShadows,
  zIndex,
  transitions,
  components: getComponentOverrides('dark'),
})

// Export design tokens for SCSS interop
export const designTokens = {
  colors,
  fontFamilyBody,
  fontFamilyHeading,
  fontFamilyMono,
  spacing,
}
