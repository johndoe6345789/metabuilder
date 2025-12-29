'use client'

import { alpha, createTheme, type Shadows } from '@mui/material/styles'

import { colors } from '../colors'
import { getComponentOverrides } from '../components'
import { fonts } from '../fonts'
import { layout } from '../layout'
import { typography } from '../typography'

const custom = {
  fonts,
  borderRadius: layout.borderRadius,
  contentWidth: layout.contentWidth,
  sidebar: layout.sidebar,
  header: layout.header,
}
const shadows = (o: number): Shadows =>
  [
    'none',
    `0 1px 2px rgba(0,0,0,${o / 2})`,
    `0 1px 3px rgba(0,0,0,${o})`,
    `0 4px 6px rgba(0,0,0,${o})`,
    `0 10px 15px rgba(0,0,0,${o})`,
    `0 20px 25px rgba(0,0,0,${o})`,
    `0 25px 50px rgba(0,0,0,${o * 2.5})`,
    ...Array(18).fill(`0 25px 50px rgba(0,0,0,${o * 2.5})`),
  ] as Shadows

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary.light,
    secondary: colors.secondary.light,
    error: colors.error.light,
    warning: colors.warning.light,
    info: colors.info.light,
    success: colors.success.light,
    neutral: colors.neutral,
    background: { default: '#ffffff', paper: colors.neutral[50] },
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
  spacing: layout.spacing,
  shape: { borderRadius: 8 },
  shadows: shadows(0.1),
  components: getComponentOverrides('light'),
  custom,
})
