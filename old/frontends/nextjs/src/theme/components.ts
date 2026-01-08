import { colors } from './base/colors'
import { fonts } from './base/fonts'

/**
 * Helper to apply alpha transparency to a color
 * Replaces MUI's alpha utility
 */
const alpha = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    if (match !== null && match.length >= 3) {
      return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${opacity})`
    }
  }
  return color
}

/**
 * Component style overrides for fakemui theming
 * This replaces MUI's ThemeOptions['components'] structure
 */
export interface ComponentOverrides {
  [componentName: string]: {
    defaultProps?: Record<string, unknown>
    styleOverrides?: Record<string, unknown>
  }
}

export const getComponentOverrides = (mode: 'light' | 'dark'): ComponentOverrides => {
  const isDark = mode === 'dark'
  const n = colors.neutral

  return {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--font-body': fonts.body,
          '--font-heading': fonts.heading,
          '--font-mono': fonts.mono,
        },
        html: { scrollBehavior: 'smooth' },
        body: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
        'code, pre, kbd': { fontFamily: fonts.mono },
        '::selection': {
          backgroundColor: isDark ? colors.primary.dark.main : colors.primary.light.main,
          color: '#fff',
        },
        '::-webkit-scrollbar': { width: 8, height: 8 },
        '::-webkit-scrollbar-track': { backgroundColor: isDark ? n[800] : n[100] },
        '::-webkit-scrollbar-thumb': { backgroundColor: isDark ? n[600] : n[400], borderRadius: 4 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 500, padding: '8px 16px' },
        sizeSmall: { padding: '4px 12px', fontSize: '0.8125rem' },
        sizeLarge: { padding: '12px 24px', fontSize: '0.9375rem' },
        containedPrimary: {
          '&:hover': {
            boxShadow: `0 4px 12px ${alpha(isDark ? colors.primary.dark.main : colors.primary.light.main, 0.4)}`,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${isDark ? n[800] : n[200]}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: '20px 24px 16px' },
        title: { fontFamily: fonts.heading, fontWeight: 600, fontSize: '1.125rem' },
        subheader: { fontSize: '0.875rem', color: isDark ? n[400] : n[600] },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: '16px 24px', '&:last-child': { paddingBottom: 24 } } },
    },
    MuiCardActions: {
      styleOverrides: {
        root: { padding: '16px 24px', borderTop: `1px solid ${isDark ? n[800] : n[200]}` },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: isDark ? n[800] : n[200] },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: isDark ? n[900] : '#fff',
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? n[700] : n[300] },
        },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiSelect: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, fontWeight: 500 }, sizeSmall: { height: 24 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, alignItems: 'center' },
        standardSuccess: {
          backgroundColor: alpha(
            isDark ? colors.success.dark.main : colors.success.light.main,
            isDark ? 0.15 : 0.1
          ),
        },
        standardError: {
          backgroundColor: alpha(
            isDark ? colors.error.dark.main : colors.error.light.main,
            isDark ? 0.15 : 0.1
          ),
        },
        standardWarning: {
          backgroundColor: alpha(
            isDark ? colors.warning.dark.main : colors.warning.light.main,
            isDark ? 0.15 : 0.1
          ),
        },
        standardInfo: {
          backgroundColor: alpha(
            isDark ? colors.info.dark.main : colors.info.light.main,
            isDark ? 0.15 : 0.1
          ),
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: fonts.heading,
          fontWeight: 600,
          fontSize: '1.25rem',
          padding: '24px 24px 16px',
        },
      },
    },
    MuiDialogContent: { styleOverrides: { root: { padding: '16px 24px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } } },
    MuiTable: { styleOverrides: { root: { borderCollapse: 'separate', borderSpacing: 0 } } },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            backgroundColor: isDark ? n[900] : n[50],
            borderBottom: `2px solid ${isDark ? n[700] : n[300]}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${isDark ? n[800] : n[200]}`, padding: '12px 16px' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: isDark ? alpha(n[700], 0.3) : alpha(n[100], 0.5) } },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 48 },
        indicator: { height: 3, borderRadius: '3px 3px 0 0' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, minHeight: 48, padding: '12px 16px' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? n[700] : n[900],
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: 6,
        },
        arrow: { color: isDark ? n[700] : n[900] },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: 8, border: `1px solid ${isDark ? n[800] : n[200]}` },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { padding: '8px 16px', borderRadius: 4, margin: '2px 8px' } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRight: `1px solid ${isDark ? n[800] : n[200]}` } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: isDark ? n[900] : '#fff',
          borderBottom: `1px solid ${isDark ? n[800] : n[200]}`,
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: isDark ? n[800] : n[200] } } },
    MuiAvatar: { styleOverrides: { root: { fontFamily: fonts.heading, fontWeight: 600 } } },
    MuiBadge: { styleOverrides: { badge: { fontWeight: 600, fontSize: '0.6875rem' } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, height: 6 } } },
    MuiSkeleton: {
      styleOverrides: { root: { borderRadius: 4, backgroundColor: isDark ? n[800] : n[200] } },
    },
    MuiAccordion: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${isDark ? n[800] : n[200]}`,
          borderRadius: 8,
          '&:before': { display: 'none' },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: { root: { padding: '0 16px', minHeight: 56 }, content: { fontWeight: 500 } },
    },
    MuiAccordionDetails: { styleOverrides: { root: { padding: '0 16px 16px' } } },
    MuiSwitch: {
      styleOverrides: {
        root: { width: 46, height: 26, padding: 0 },
        switchBase: { padding: 2, '&.Mui-checked': { transform: 'translateX(20px)' } },
        thumb: { width: 22, height: 22 },
        track: { borderRadius: 13, opacity: 1, backgroundColor: isDark ? n[700] : n[300] },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 8, margin: '2px 8px', padding: '8px 12px' } },
    },
    MuiSnackbar: { styleOverrides: { root: { '& .MuiPaper-root': { borderRadius: 8 } } } },
  }
}
