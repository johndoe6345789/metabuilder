/**
 * MUI Theme Type Extensions
 * 
 * This file extends Material-UI's theme interface with custom properties.
 * All custom design tokens and component variants should be declared here.
 */

import '@mui/material/styles'
import '@mui/material/Typography'
import '@mui/material/Button'

// ============================================================================
// Custom Palette Extensions
// ============================================================================

declare module '@mui/material/styles' {
  // Extend palette with custom neutral colors
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

  // Custom typography variants
  interface TypographyVariants {
    code: React.CSSProperties
    kbd: React.CSSProperties
    label: React.CSSProperties
  }

  interface TypographyVariantsOptions {
    code?: React.CSSProperties
    kbd?: React.CSSProperties
    label?: React.CSSProperties
  }

  // Custom theme properties
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

// ============================================================================
// Typography Variant Mapping
// ============================================================================

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true
    kbd: true
    label: true
  }
}

// ============================================================================
// Button Variants & Colors
// ============================================================================

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true
    ghost: true
  }

  interface ButtonPropsColorOverrides {
    neutral: true
  }
}

// ============================================================================
// Chip Variants
// ============================================================================

declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    soft: true
  }

  interface ChipPropsColorOverrides {
    neutral: true
  }
}

// ============================================================================
// IconButton Colors
// ============================================================================

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    neutral: true
  }
}

// ============================================================================
// Badge Colors
// ============================================================================

declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides {
    neutral: true
  }
}

// ============================================================================
// Alert Variants
// ============================================================================

declare module '@mui/material/Alert' {
  interface AlertPropsVariantOverrides {
    soft: true
  }
}

export {}
