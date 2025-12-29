import '@mui/material/styles'
import '@mui/material/Typography'
import '@mui/material/Button'
import '@mui/material/Chip'
import '@mui/material/IconButton'
import '@mui/material/Badge'
import '@mui/material/Alert'

// Typography variants and component overrides
declare module '@mui/material/styles' {
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
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true
    kbd: true
    label: true
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true
    ghost: true
  }

  interface ButtonPropsColorOverrides {
    neutral: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    soft: true
  }

  interface ChipPropsColorOverrides {
    neutral: true
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    neutral: true
  }
}

declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides {
    neutral: true
  }
}

declare module '@mui/material/Alert' {
  interface AlertPropsVariantOverrides {
    soft: true
  }
}

export {}
