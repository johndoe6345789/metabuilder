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
 * Component style overrides for m3 theming
 * This replaces MUI's ThemeOptions['components'] structure
 */
export interface ComponentOverrides {
  [componentName: string]: {
    defaultProps?: Record<string, unknown>
    styleOverrides?: Record<string, unknown>
  }
}

export const getComponentOverrides = (
  mode: 'light' | 'dark'
): ComponentOverrides => {
  const isDark = mode === 'dark'
  const n = colors.neutral
  const radius = {
    control: 14,
    compact: 12,
    surface: 20,
    overlay: 24,
    pill: 999,
  }

  return {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--font-body': fonts.body,
          '--font-heading': fonts.heading,
          '--font-mono': fonts.mono,
        },
        html: { scrollBehavior: 'smooth' },
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontSize: '17px',
          lineHeight: 1.6,
        },
        'code, pre, kbd': { fontFamily: fonts.mono },
        '::selection': {
          backgroundColor: isDark
            ? colors.primary.dark.main
            : colors.primary.light.main,
          color: '#fff',
        },
        '::-webkit-scrollbar': { width: 8, height: 8 },
        '::-webkit-scrollbar-track': {
          backgroundColor: isDark ? n[800] : n[100],
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: isDark ? n[600] : n[400],
          borderRadius: radius.pill,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.pill,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.975rem',
          minHeight: 42,
          padding: '10px 18px',
        },
        sizeSmall: { padding: '7px 14px', fontSize: '0.925rem' },
        sizeLarge: { padding: '13px 26px', fontSize: '1.05rem' },
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
          borderRadius: radius.surface,
          border: `1px solid ${isDark ? n[800] : n[200]}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: '20px 24px 16px' },
        title: {
          fontFamily: fonts.heading,
          fontWeight: 700,
          fontSize: '1.25rem',
        },
        subheader: { fontSize: '1rem', color: isDark ? n[400] : n[600] },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: '16px 24px', '&:last-child': { paddingBottom: 24 } },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          borderTop: `1px solid ${isDark ? n[800] : n[200]}`,
        },
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
            borderRadius: radius.control,
            backgroundColor: isDark ? n[900] : '#fff',
            fontSize: '1rem',
            minHeight: 44,
          },
          '& .MuiInputLabel-root': { fontSize: '1rem', fontWeight: 650 },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? n[700] : n[300],
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: radius.control } },
    },
    MuiSelect: { styleOverrides: { root: { borderRadius: radius.control } } },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radius.pill,
          fontWeight: 650,
          fontSize: '0.9rem',
        },
        sizeSmall: { height: 28, fontSize: '0.85rem' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: radius.control, alignItems: 'center' },
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
    MuiDialog: { styleOverrides: { paper: { borderRadius: radius.overlay } } },
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
    MuiDialogActions: {
      styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } },
    },
    MuiTable: {
      styleOverrides: {
        root: { borderCollapse: 'separate', borderSpacing: 0 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 700,
            fontSize: '0.95rem',
            backgroundColor: isDark ? n[900] : n[50],
            borderBottom: `2px solid ${isDark ? n[700] : n[300]}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${isDark ? n[800] : n[200]}`,
          fontSize: '0.975rem',
          padding: '14px 18px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: isDark ? alpha(n[700], 0.3) : alpha(n[100], 0.5),
          },
        },
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
        root: {
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
          minHeight: 52,
          padding: '14px 18px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? n[700] : n[900],
          fontSize: '0.875rem',
          padding: '8px 12px',
          borderRadius: radius.compact,
        },
        arrow: { color: isDark ? n[700] : n[900] },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: radius.surface,
          border: `1px solid ${isDark ? n[800] : n[200]}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          borderRadius: radius.control,
          fontSize: '1rem',
          margin: '2px 8px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: `1px solid ${isDark ? n[800] : n[200]}` },
      },
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
    MuiDivider: {
      styleOverrides: { root: { borderColor: isDark ? n[800] : n[200] } },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontFamily: fonts.heading, fontWeight: 600 } },
    },
    MuiBadge: {
      styleOverrides: { badge: { fontWeight: 700, fontSize: '0.75rem' } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: radius.pill, height: 6 } },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          backgroundColor: isDark ? n[800] : n[200],
        },
      },
    },
    MuiAccordion: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${isDark ? n[800] : n[200]}`,
          borderRadius: radius.surface,
          '&:before': { display: 'none' },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: { padding: '0 16px', minHeight: 56 },
        content: { fontWeight: 500 },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: { root: { padding: '0 16px 16px' } },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { width: 46, height: 26, padding: 0 },
        switchBase: {
          padding: 2,
          '&.Mui-checked': { transform: 'translateX(20px)' },
        },
        thumb: { width: 22, height: 22 },
        track: {
          borderRadius: 13,
          opacity: 1,
          backgroundColor: isDark ? n[700] : n[300],
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: radius.pill } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          margin: '2px 8px',
          padding: '8px 12px',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: { '& .MuiPaper-root': { borderRadius: radius.surface } },
      },
    },
  }
}
