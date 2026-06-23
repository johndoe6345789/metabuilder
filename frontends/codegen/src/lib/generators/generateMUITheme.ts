import { ThemeConfig } from '@/types/project'

export function generateTheme(theme: ThemeConfig): string {
  const lightVariant = theme.variants.find((v) => v.id === 'light') || theme.variants[0]
  const darkVariant = theme.variants.find((v) => v.id === 'dark')

  const baseTheme = {
    name: 'm3-scss',
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize.medium,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
  }

  if (!lightVariant) {
    return `export const theme = ${JSON.stringify(baseTheme, null, 2)} as const`
  }

  const themeCode = {
    ...baseTheme,
    light: {
      primary: lightVariant.colors.primaryColor,
      secondary: lightVariant.colors.secondaryColor,
      error: lightVariant.colors.errorColor,
      warning: lightVariant.colors.warningColor,
      success: lightVariant.colors.successColor,
      background: lightVariant.colors.background,
      surface: lightVariant.colors.surface,
      text: lightVariant.colors.text,
      textSecondary: lightVariant.colors.textSecondary,
      border: lightVariant.colors.border,
    },
    ...(darkVariant
      ? {
          dark: {
            primary: darkVariant.colors.primaryColor,
            secondary: darkVariant.colors.secondaryColor,
            error: darkVariant.colors.errorColor,
            warning: darkVariant.colors.warningColor,
            success: darkVariant.colors.successColor,
            background: darkVariant.colors.background,
            surface: darkVariant.colors.surface,
            text: darkVariant.colors.text,
            textSecondary: darkVariant.colors.textSecondary,
            border: darkVariant.colors.border,
          },
        }
      : {}),
  }

  return `export const theme = ${JSON.stringify(themeCode, null, 2)} as const`
}

export const generateMUITheme = generateTheme
