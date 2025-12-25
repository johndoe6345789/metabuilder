'use client'

import { createTheme, alpha, ThemeOptions } from '@mui/material/styles'
import { colors, fonts, layout } from './tokens'
import { getComponentOverrides } from './components'

const typography = {
  fontFamily: fonts.body,
  h1: { fontFamily: fonts.heading, fontWeight: 700, fontSize: '3rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
  h2: { fontFamily: fonts.heading, fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.25, letterSpacing: '-0.01em' },
  h3: { fontFamily: fonts.heading, fontWeight: 600, fontSize: '1.875rem', lineHeight: 1.3 },
  h4: { fontFamily: fonts.heading, fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.35 },
  h5: { fontFamily: fonts.heading, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
  h6: { fontFamily: fonts.heading, fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
  subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 },
  subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5 },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', lineHeight: 1.4 },
  overline: { fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const },
  button: { fontWeight: 500, fontSize: '0.875rem', textTransform: 'none' as const },
  code: { fontFamily: fonts.mono, fontSize: '0.875rem', backgroundColor: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4 },
  kbd: { fontFamily: fonts.mono, fontSize: '0.75rem', fontWeight: 500, padding: '2px 8px', borderRadius: 4, border: '1px solid' },
  label: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
}

const shadows = (opacity: number) => [
  'none',
  `0 1px 2px rgba(0,0,0,${opacity * 0.5})`,
  `0 1px 3px rgba(0,0,0,${opacity}), 0 1px 2px rgba(0,0,0,${opacity})`,
  `0 4px 6px rgba(0,0,0,${opacity}), 0 2px 4px rgba(0,0,0,${opacity})`,
  `0 10px 15px rgba(0,0,0,${opacity}), 0 4px 6px rgba(0,0,0,${opacity})`,
  `0 20px 25px rgba(0,0,0,${opacity}), 0 8px 10px rgba(0,0,0,${opacity})`,
  `0 25px 50px rgba(0,0,0,${opacity * 2.5})`,
  ...Array(18).fill(`0 25px 50px rgba(0,0,0,${opacity * 2.5})`),
] as ThemeOptions['shadows']

const custom = { fonts, borderRadius: layout.borderRadius, contentWidth: layout.contentWidth, sidebar: layout.sidebar, header: layout.header }

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
    text: { primary: colors.neutral[900], secondary: colors.neutral[600], disabled: colors.neutral[400] },
    divider: colors.neutral[200],
    action: { active: colors.neutral[700], hover: alpha(colors.neutral[500], 0.08), selected: alpha(colors.primary.light.main, 0.12), disabled: colors.neutral[400], disabledBackground: colors.neutral[200] },
  },
  typography,
  spacing: layout.spacing,
  shape: { borderRadius: 8 },
  shadows: shadows(0.1),
  components: getComponentOverrides('light'),
  custom,
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
    neutral: colors.neutral,
    background: { default: colors.neutral[950], paper: colors.neutral[900] },
    text: { primary: colors.neutral[100], secondary: colors.neutral[400], disabled: colors.neutral[600] },
    divider: colors.neutral[800],
    action: { active: colors.neutral[300], hover: alpha(colors.neutral[400], 0.12), selected: alpha(colors.primary.dark.main, 0.2), disabled: colors.neutral[600], disabledBackground: colors.neutral[800] },
  },
  typography,
  spacing: layout.spacing,
  shape: { borderRadius: 8 },
  shadows: shadows(0.4),
  components: getComponentOverrides('dark'),
  custom,
})

export { colors, fonts, layout } from './tokens'
