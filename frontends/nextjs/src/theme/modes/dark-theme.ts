'use client'

import { createTheme, alpha, type Shadows } from '@mui/material/styles'
import { colors } from '../colors'
import { fonts } from '../fonts'
import { layout } from '../layout'
import { typography } from '../typography'
import { getComponentOverrides } from '../components'

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

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary.dark,
    secondary: colors.secondary.dark,
    error: colors.error.dark,
    warning: colors.warning.dark,
    info: colors.info.dark,
    success: colors.success.dark,
    neutral: colors.neutral,
    background: { default: colors.neutral[950], paper: colors.neutral[900] },
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
  spacing: layout.spacing,
  shape: { borderRadius: 8 },
  shadows: shadows(0.4),
  components: getComponentOverrides('dark'),
  custom,
})
