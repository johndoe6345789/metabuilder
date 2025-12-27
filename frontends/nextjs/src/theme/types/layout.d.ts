import '@mui/material/styles'

// Custom theme properties for layout and design tokens
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      fonts: {
        body: string
        heading: string
        mono: string
      }
      borderRadius: {
        none: number
        sm: number
        md: number
        lg: number
        xl: number
        full: number
      }
      contentWidth: {
        sm: string
        md: string
        lg: string
        xl: string
        full: string
      }
      sidebar: {
        width: number
        collapsedWidth: number
      }
      header: {
        height: number
      }
    }
  }

  interface ThemeOptions {
    custom?: {
      fonts?: {
        body?: string
        heading?: string
        mono?: string
      }
      borderRadius?: {
        none?: number
        sm?: number
        md?: number
        lg?: number
        xl?: number
        full?: number
      }
      contentWidth?: {
        sm?: string
        md?: string
        lg?: string
        xl?: string
        full?: string
      }
      sidebar?: {
        width?: number
        collapsedWidth?: number
      }
      header?: {
        height?: number
      }
    }
  }
}

export {}
