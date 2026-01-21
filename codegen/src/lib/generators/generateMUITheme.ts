import { ThemeConfig } from '@/types/project'

export function generateMUITheme(theme: ThemeConfig): string {
  if (!theme.variants || theme.variants.length === 0) {
    return `import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
  },
});`
  }

  const lightVariant = theme.variants.find((v) => v.id === 'light') || theme.variants[0]
  const darkVariant = theme.variants.find((v) => v.id === 'dark')

  let themeCode = `import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '${lightVariant.colors.primaryColor}',
    },
    secondary: {
      main: '${lightVariant.colors.secondaryColor}',
    },
    error: {
      main: '${lightVariant.colors.errorColor}',
    },
    warning: {
      main: '${lightVariant.colors.warningColor}',
    },
    success: {
      main: '${lightVariant.colors.successColor}',
    },
    background: {
      default: '${lightVariant.colors.background}',
      paper: '${lightVariant.colors.surface}',
    },
    text: {
      primary: '${lightVariant.colors.text}',
      secondary: '${lightVariant.colors.textSecondary}',
    },
  },
  typography: {
    fontFamily: '${theme.fontFamily}',
    fontSize: ${theme.fontSize.medium},
  },
  spacing: ${theme.spacing},
  shape: {
    borderRadius: ${theme.borderRadius},
  },
});
`

  if (darkVariant) {
    themeCode += `
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '${darkVariant.colors.primaryColor}',
    },
    secondary: {
      main: '${darkVariant.colors.secondaryColor}',
    },
    error: {
      main: '${darkVariant.colors.errorColor}',
    },
    warning: {
      main: '${darkVariant.colors.warningColor}',
    },
    success: {
      main: '${darkVariant.colors.successColor}',
    },
    background: {
      default: '${darkVariant.colors.background}',
      paper: '${darkVariant.colors.surface}',
    },
    text: {
      primary: '${darkVariant.colors.text}',
      secondary: '${darkVariant.colors.textSecondary}',
    },
  },
  typography: {
    fontFamily: '${theme.fontFamily}',
    fontSize: ${theme.fontSize.medium},
  },
  spacing: ${theme.spacing},
  shape: {
    borderRadius: ${theme.borderRadius},
  },
});

export const theme = lightTheme;`
  } else {
    themeCode += `\nexport const theme = lightTheme;`
  }

  return themeCode
}
