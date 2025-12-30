import '@mui/material/styles'

// Extend palette with custom neutral colors
declare module '@mui/material/styles' {
  interface Palette {
    neutral: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
      950: string
    }
  }

  interface PaletteOptions {
    neutral?: {
      50?: string
      100?: string
      200?: string
      300?: string
      400?: string
      500?: string
      600?: string
      700?: string
      800?: string
      900?: string
      950?: string
    }
  }
}

export {}
