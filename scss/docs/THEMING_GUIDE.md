# Fakemui Theming Guide

Complete guide to theming in Fakemui, including built-in themes, customization, and dynamic theme switching.

## Overview

Fakemui's theming system is based on Material Design 3, providing a comprehensive design token system for consistent, accessible, and customizable user interfaces.

**Key features**:
- 9 built-in themes
- Custom theme creation
- Dynamic theme switching
- Material Design 3 compliance
- Accessibility standards (WCAG AA+)

## Built-in Themes

### Available Themes

| Theme | Description | Use Case |
|-------|-------------|----------|
| **default** | Primary blue (Material Design 3 default) | General applications |
| **light** | Light mode optimization | Daytime/bright environments |
| **dark** | Dark mode optimization | Nighttime/reduced eye strain |
| **ocean** | Ocean blue with teal accents | Calm, professional applications |
| **forest** | Green with natural tones | Environmental/wellness apps |
| **sunset** | Warm orange/red tones | Creative/vibrant applications |
| **lavender** | Purple with soft tones | Design-focused applications |
| **midnight** | Deep blue with dark background | Night mode preference |
| **rose** | Pink/rose tones | Fashion/lifestyle applications |

### Theme Structure

Each theme defines:

```typescript
interface Theme {
  palette: {
    // Primary colors
    primary: { main, light, dark, contrastText }
    secondary: { main, light, dark, contrastText }
    error: { main, light, dark, contrastText }
    warning: { main, light, dark, contrastText }
    info: { main, light, dark, contrastText }
    success: { main, light, dark, contrastText }

    // Neutral colors
    background: { default, paper }
    text: { primary, secondary, disabled, hint }
    divider: color
    action: { active, hover, selected, disabled }

    // Elevation colors (5 levels)
    surface1, surface2, surface3, surface4, surface5
  }

  typography: {
    fontFamily: string
    fontSize: number
    fontWeightLight: number
    fontWeightRegular: number
    fontWeightMedium: number
    fontWeightBold: number

    // Typography variants
    h1, h2, h3, h4, h5, h6: TypographyOptions
    body1, body2: TypographyOptions
    button, caption: TypographyOptions
  }

  spacing: (multiplier: number) => number

  shape: {
    borderRadius: number
  }

  shadows: string[]

  transitions: {
    duration: { shortest, shorter, standard, complex }
    easing: { easeInOut, easeOut, easeIn, linear }
  }
}
```

## Using Built-in Themes

### Basic Theme Setup

```typescript
import { ThemeProvider } from '@/fakemui/theming'
import App from './App'

export function Root() {
  return (
    <ThemeProvider theme="dark">
      <App />
    </ThemeProvider>
  )
}
```

### Reading Current Theme

```typescript
import { useTheme } from '@/fakemui/theming'

export function ComponentWithTheme() {
  const { theme, palette } = useTheme()

  return (
    <Box sx={{ backgroundColor: palette.primary.main }}>
      Current theme: {theme}
    </Box>
  )
}
```

### Accessing Theme in sx Prop

```typescript
import { Box, Button } from '@/fakemui'

export function StyledComponent() {
  return (
    <Box sx={{
      // Theme colors
      backgroundColor: 'background.paper',
      color: 'text.primary',
      borderColor: 'divider',

      // Theme spacing
      padding: 2,  // 16px (theme.spacing(2))
      gap: 1,      // 8px (theme.spacing(1))

      // Theme shapes
      borderRadius: 1,  // 4px

      // Elevation/shadows
      boxShadow: 1  // theme.shadows[1]
    }}>
      Content with theme
    </Box>
  )
}
```

## Creating Custom Themes

### Option 1: Extend Existing Theme

```typescript
import { createTheme } from '@/fakemui/theming'

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',     // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ec4899',     // Pink
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff'
    }
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14
  }
})

// Use custom theme
<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### Option 2: Full Theme Customization

```typescript
import { createTheme } from '@/fakemui/theming'

const brandTheme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',       // Brand blue
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#7c3aed',       // Brand purple
      light: '#a78bfa',
      dark: '#6d28d9',
      contrastText: '#ffffff'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff'
    },
    background: {
      default: '#ffffff',
      paper: '#f9fafb'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.60)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)'
    }
  },

  typography: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,

    h1: {
      fontSize: '6rem',
      fontWeight: 300,
      lineHeight: 1.167,
      letterSpacing: '-0.015625em'
    },
    h2: {
      fontSize: '3.75rem',
      fontWeight: 300,
      lineHeight: 1.2,
      letterSpacing: 0
    },
    h3: {
      fontSize: '3rem',
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: '0.0125em'
    },
    h4: {
      fontSize: '2.125rem',
      fontWeight: 500,
      lineHeight: 1.235,
      letterSpacing: 0
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.334,
      letterSpacing: 0
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0125em'
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.03125em'
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.0178571429em'
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.0892857143em',
      textTransform: 'uppercase'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.67,
      letterSpacing: '0.0333333333em'
    }
  },

  shape: {
    borderRadius: 4
  },

  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2)',
    '0px 3px 1px -2px rgba(0,0,0,0.2)',
    '0px 3px 3px -2px rgba(0,0,0,0.2)',
    '0px 2px 4px -1px rgba(0,0,0,0.2)',
    '0px 3px 5px -1px rgba(0,0,0,0.2)'
  ],

  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      standard: 300,
      complex: 375
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      linear: 'linear'
    }
  }
})

<ThemeProvider theme={brandTheme}>
  <App />
</ThemeProvider>
```

## Dynamic Theme Switching

### Basic Theme Switcher

```typescript
import { Box, Button, Stack } from '@/fakemui'
import { useTheme } from '@/fakemui/theming'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const themes = ['default', 'dark', 'ocean', 'forest', 'sunset']

  return (
    <Box>
      <p>Current theme: {theme}</p>
      <Stack direction="row" spacing={1}>
        {themes.map((t) => (
          <Button
            key={t}
            variant={theme === t ? 'contained' : 'outlined'}
            onClick={() => setTheme(t)}
          >
            {t}
          </Button>
        ))}
      </Stack>
    </Box>
  )
}
```

### Theme Switcher in AppBar

```typescript
import { AppBar, Toolbar, Box, Select } from '@/fakemui'
import { useTheme } from '@/fakemui/theming'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>MyApp</Box>
        <Select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          options={[
            { label: 'Default', value: 'default' },
            { label: 'Dark', value: 'dark' },
            { label: 'Ocean', value: 'ocean' }
          ]}
          sx={{ color: 'white', minWidth: 120 }}
        />
      </Toolbar>
    </AppBar>
  )
}
```

### Persist Theme Preference

```typescript
import { useTheme } from '@/fakemui/theming'
import { useEffect } from 'react'

export function App() {
  const { theme, setTheme } = useTheme()

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('app-theme', theme)
  }, [theme])

  return <AppContent />
}
```

### System Preference Detection

```typescript
import { useTheme } from '@/fakemui/theming'
import { useEffect } from 'react'

export function App() {
  const { setTheme } = useTheme()

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'default')
    }

    // Set initial theme based on system preference
    setTheme(prefersDark.matches ? 'dark' : 'default')

    // Listen for changes
    prefersDark.addEventListener('change', handleChange)
    return () => prefersDark.removeEventListener('change', handleChange)
  }, [setTheme])

  return <AppContent />
}
```

## Color System

### Material Design 3 Color Roles

```typescript
// Core colors
primary       // Primary interactive color
secondary     // Secondary interactive color
tertiary      // Tertiary interactive color (accent)

// Semantic colors
error         // Error/destructive actions
warning       // Warning messages
info          // Informational messages
success       // Success confirmations

// Neutral colors
background    // Background surface
surface       // Surface elements (cards, containers)
text          // Text content
outline       // Borders, dividers
```

### Using Colors in Components

```typescript
import { Button, Card, Typography, Box } from '@/fakemui'

export function ColorDemo() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
      {/* Primary variants */}
      <Button color="primary" variant="contained">Primary</Button>
      <Button color="primary" variant="outlined">Primary</Button>
      <Button color="primary" variant="text">Primary</Button>

      {/* Secondary variants */}
      <Button color="secondary" variant="contained">Secondary</Button>
      <Button color="secondary" variant="outlined">Secondary</Button>
      <Button color="secondary" variant="text">Secondary</Button>

      {/* Semantic colors */}
      <Button color="error" variant="contained">Delete</Button>
      <Button color="warning" variant="contained">Warning</Button>
      <Button color="success" variant="contained">Success</Button>

      {/* In cards */}
      <Card sx={{ p: 2, backgroundColor: 'success.light' }}>
        <Typography color="success.main">Success message</Typography>
      </Card>
    </Box>
  )
}
```

## Material Design 3 Token Reference

### Spacing

```typescript
// 8px base unit
sx={{
  p: 1      // 8px
  p: 2      // 16px
  p: 3      // 24px
  p: 4      // 32px
  gap: 0.5  // 4px
}}
```

### Elevation/Shadows

```typescript
// 5 elevation levels
boxShadow: 0  // none
boxShadow: 1  // low
boxShadow: 2  // low-medium
boxShadow: 3  // medium
boxShadow: 4  // medium-high
boxShadow: 5  // high
```

### Typography

```typescript
// 6 heading levels
variant="h1" // Display large
variant="h2" // Display medium
variant="h3" // Display small
variant="h4" // Headline large
variant="h5" // Headline medium
variant="h6" // Headline small

// Body text
variant="body1" // Body large
variant="body2" // Body medium

// Special
variant="button"  // Button text
variant="caption" // Caption
```

### Border Radius

```typescript
// All components support borderRadius
sx={{ borderRadius: 1 }}    // 4px
sx={{ borderRadius: 1.5 }}  // 6px
sx={{ borderRadius: 2 }}    // 8px
sx={{ borderRadius: '50%' }} // Circular
```

## Responsive Design

### Breakpoints

Material Design 3 defines responsive breakpoints:

```typescript
// Mobile-first breakpoints
xs: 0      // Extra small (phones)
sm: 600    // Small (tablets)
md: 960    // Medium (small laptops)
lg: 1264   // Large (laptops)
xl: 1904   // Extra large (desktops)
```

### Using Breakpoints in sx

```typescript
<Box sx={{
  fontSize: '1rem',
  '@media (min-width: 600px)': {
    fontSize: '1.25rem'
  },
  '@media (min-width: 960px)': {
    fontSize: '1.5rem'
  }
}}>
  Responsive text
</Box>
```

### Responsive Grid

```typescript
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    Full width on mobile
    Half width on tablet
    Third width on medium
    Quarter width on large
  </Grid>
</Grid>
```

## Accessibility in Theming

### Contrast Ratios

All theme colors maintain WCAG AA+ contrast:

```typescript
// Light text on dark background
color: 'text.primary' // 87% opacity = 4.5:1 ratio

// Dark text on light background
color: 'text.primary' // 87% opacity = 14:1 ratio
```

### Color Blindness Support

Fakemui themes avoid red-green only differentiation:

```typescript
// ✅ Good - uses multiple visual cues
<Alert severity="error" icon={<ErrorIcon />}>
  Error message
</Alert>

// ❌ Avoid - relies only on red color
<div style={{ color: 'red' }}>Error</div>
```

### High Contrast Mode

```typescript
const highContrastTheme = createTheme({
  palette: {
    text: {
      primary: '#000000',  // Full black
      secondary: '#333333' // Darker gray
    },
    background: {
      default: '#ffffff',  // Full white
      paper: '#f5f5f5'
    }
  }
})
```

## Common Theming Patterns

### Dark Mode Toggle

```typescript
import { IconButton, useTheme } from '@/fakemui'
import { DarkModeIcon, LightModeIcon } from '@/fakemui/icons'

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <IconButton
      onClick={() => setTheme(isDark ? 'default' : 'dark')}
      color="inherit"
    >
      {isDark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  )
}
```

### Brand Customization

```typescript
const createBrandTheme = (brandColor) => {
  return createTheme({
    palette: {
      primary: {
        main: brandColor,
        light: lighten(brandColor, 0.3),
        dark: darken(brandColor, 0.3),
        contrastText: '#ffffff'
      }
    }
  })
}
```

### Accessibility Overrides

```typescript
const accessibilityTheme = createTheme({
  palette: {
    text: {
      primary: '#000000',
      secondary: '#404040',
      disabled: '#808080'
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.08)',
      selected: 'rgba(0, 0, 0, 0.16)'
    }
  },
  typography: {
    fontSize: 16, // Larger base font
    h6: {
      fontSize: '1.5rem' // Larger headings
    }
  }
})
```

## Best Practices

1. **Maintain sufficient contrast** - Aim for WCAG AA+ (4.5:1)
2. **Use semantic colors** - Use `error`, `success`, `warning` for meaning
3. **Don't rely on color alone** - Combine with icons/text
4. **Test with color blindness simulators** - Chrome DevTools has built-in tool
5. **Support system preferences** - Detect `prefers-color-scheme`
6. **Persist user choice** - Save theme in localStorage
7. **Use theme tokens** - Avoid hardcoded colors
8. **Document custom themes** - Include usage examples
9. **Test on real devices** - Colors vary across screens
10. **Follow Material Design 3** - Use official specifications

## Troubleshooting

### Theme not applying

```typescript
// ✅ Correct - Wrap app in ThemeProvider
<ThemeProvider theme="dark">
  <App />
</ThemeProvider>

// ❌ Wrong - Missing wrapper
<App />
```

### Colors not updating

```typescript
// ✅ Use useTheme hook
const { setTheme } = useTheme()
setTheme('dark')

// ❌ Don't set directly
window.fakemui.theme = 'dark' // Won't work
```

### Custom theme not working

```typescript
// ✅ Pass theme object to ThemeProvider
const customTheme = createTheme({ /* ... */ })
<ThemeProvider theme={customTheme}>

// ❌ Pass theme string (only works for built-in themes)
<ThemeProvider theme={customTheme}> // Won't work
```

## Resources

- [Material Design 3 Official Guide](https://m3.material.io/)
- Material Design 3 Color System: https://m3.material.io/styles/color/overview
- Material Design 3 Typography: https://m3.material.io/styles/typography/overview
- WCAG Contrast Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
