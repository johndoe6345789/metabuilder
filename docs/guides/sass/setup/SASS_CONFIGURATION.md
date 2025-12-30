# SASS Configuration & Usage Guide

## Overview

The MetaBuilder project now uses SASS (Syntactically Awesome Stylesheets) for advanced styling capabilities. SASS has been configured as a dev dependency and is automatically compiled by Vite/Next.js during development and builds.

## Installation

SASS is already installed as a dev dependency (`sass` package). It will compile automatically during:
- `npm run dev` (development)
- `npm run build` (production build)
- `npm run dev:vite` (Vite development)
- `npm run build:vite` (Vite build)

## Directory Structure

```
src/
├── main.scss              # Main entry point - imports all stylesheets
├── index.scss             # Secondary import point (for compatibility)
└── styles/
    ├── theme.scss         # Theme definitions and CSS variables
    ├── _variables.scss    # Color palette, typography, spacing, breakpoints
    ├── _mixins.scss       # Reusable SASS mixins
    ├── _base.scss         # Global reset and base element styles
    └── _components.scss   # Component classes and utilities
```

## File Descriptions

### `_variables.scss`
Contains all design tokens including:
- **Colors**: oklch color space definitions (primary, secondary, success, error, warning, info, neutral palette)
- **Typography**: Font families (IBM Plex Sans, Space Grotesk, JetBrains Mono) and sizes (xs to 5xl)
- **Spacing**: 8px-based scale ($space-0 through $space-24)
- **Border Radius**: Rounded corner values (sm to 2xl, plus full)
- **Shadows**: Elevation levels (sm, md, lg, xl, 2xl)
- **Transitions**: Timing values (fast, base, slow)
- **Breakpoints**: Responsive breakpoints (xs to 2xl)
- **Z-index**: Layering scale for stacking contexts

### `_mixins.scss`
Provides reusable SASS mixins for:
- **Layout**: Flexbox (`flex-center`, `flex-between`, `flex-column`), Grid, Positioning
- **Typography**: Heading styles (h1-h6), Body text, Text utilities (truncate, line-clamp)
- **Components**: Buttons (primary, secondary), Cards, Inputs, Badges
- **Responsive**: Breakpoint utilities (@mixin breakpoint-sm/md/lg/xl/2xl)
- **Utilities**: Margins, Padding, Clearfix, Hardware acceleration, Elevation, Gradients

### `_base.scss`
Global styles including:
- CSS reset and normalization
- HTML/Body baseline styles
- Typography elements (h1-h6, p, a, code, pre)
- Form elements (input, textarea, select, button)
- List and table styling
- Image and media defaults
- Scrollbar styling
- Selection styling

### `_components.scss`
Pre-built component classes:
- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`, `.btn-warning`, plus sizing variants (sm, md, lg)
- **Cards**: `.card`, `.card-header`, `.card-body`, `.card-footer`, `.card-compact`, `.card-elevated`
- **Forms**: `.form-group`, `.form-label`, `.form-help`, `.form-error`, `.form-success`
- **Badges**: `.badge`, `.badge-primary`, `.badge-success`, `.badge-danger`, `.badge-warning`, `.badge-info`
- **Alerts**: `.alert`, `.alert-primary`, `.alert-success`, `.alert-warning`, `.alert-danger`, `.alert-info`
- **Layout**: `.container`, `.grid`, `.flex` with responsive variants
- **Text Utilities**: Color, alignment, text transformation utilities
- **Spacing Utilities**: Margin and padding helpers (mt-0 through mt-24, etc.)
- **Visibility**: `.hidden`, `.invisible`, `.sr-only` (screen reader only)
- **Responsive Display**: Show/hide utilities for different breakpoints

### `theme.scss`
Contains:
- CSS custom properties (variables) mapped from SASS variables
- Light theme setup (default)
- Dark theme support with `[data-theme='dark']` selector
- Accessibility preferences:
  - High contrast mode support
  - Reduced motion support
  - Reduced transparency support

## Usage Examples

### Using Variables

```scss
@import '@/styles/variables.scss';

.my-component {
  background-color: $bg-primary;
  color: $fg-primary;
  padding: $space-4;
  border-radius: $radius-md;
  font-family: $font-family-body;
}
```

### Using Mixins

```scss
@import '@/styles/mixins.scss';

.my-button {
  @include btn-primary;
  
  &:hover {
    @include elevation(3);
  }
}

.my-flex-container {
  @include flex-between;
  gap: $space-4;
}

// Responsive
.my-grid {
  @include grid(1);
  
  @include breakpoint-md {
    @include grid(2);
  }
  
  @include breakpoint-lg {
    @include grid(3);
  }
}
```

### Using Pre-built Components

```html
<!-- Button -->
<button class="btn btn-primary btn-lg">Click Me</button>

<!-- Card -->
<div class="card">
  <div class="card-header">
    <h2>Card Title</h2>
  </div>
  <div class="card-body">
    <p>Card content here</p>
  </div>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 grid-gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Spacing -->
<div class="mt-8 mb-4 px-6">Content with margins</div>

<!-- Responsive -->
<div class="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

### Creating New Component Styles

```scss
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.custom-component {
  @include flex-column;
  gap: $space-4;
  padding: $space-6;
  background-color: $bg-primary;
  border-radius: $radius-lg;
  @include elevation(2);

  &:hover {
    @include elevation(3);
  }

  @include breakpoint-md {
    @include grid(2);
  }

  .title {
    @include heading-3;
    color: $color-primary;
  }

  .description {
    @include text-sm;
    color: $fg-secondary;
  }
}
```

## Color System

### Oklahoma LCH Color Space
Colors use the oklch color space for better perceptual consistency:
```
oklch(lightness saturation hue)
```

### Predefined Colors
- **Primary**: `$color-primary` (oklch(0.64 0.22 334.61)) - Purple
- **Secondary**: `$color-secondary` (oklch(0.59 0.17 39.32)) - Orange/Gold
- **Success**: `$color-success` (oklch(0.72 0.16 149.47)) - Green
- **Warning**: `$color-warning` (oklch(0.75 0.19 70.08)) - Yellow
- **Error**: `$color-error` (oklch(0.57 0.28 25.39)) - Red
- **Info**: `$color-info` (oklch(0.64 0.19 204.86)) - Blue
- **Neutral**: `$color-neutral-50` to `$color-neutral-950` - Grayscale

## Spacing Scale

8px base unit system:
```
$space-1  = 0.25rem   (4px)
$space-2  = 0.5rem    (8px)
$space-3  = 0.75rem   (12px)
$space-4  = 1rem      (16px)
$space-5  = 1.25rem   (20px)
$space-6  = 1.5rem    (24px)
$space-8  = 2rem      (32px)
$space-10 = 2.5rem    (40px)
... and so on
```

## Typography

### Font Families
- **Body**: IBM Plex Sans (primary sans-serif)
- **Headings**: Space Grotesk (distinctive heading font)
- **Monospace**: JetBrains Mono (code/technical content)

### Font Sizes
- `$font-size-xs` = 0.75rem (12px)
- `$font-size-sm` = 0.875rem (14px)
- `$font-size-base` = 1rem (16px)
- `$font-size-lg` = 1.125rem (18px)
- `$font-size-xl` = 1.25rem (20px)
- ... up to `$font-size-5xl` = 3rem (48px)

## Breakpoints (Mobile-First)

```scss
$breakpoint-xs:   320px   // Extra small devices
$breakpoint-sm:   640px   // Small devices
$breakpoint-md:   768px   // Medium devices (tablets)
$breakpoint-lg:   1024px  // Large devices (desktops)
$breakpoint-xl:   1280px  // Extra large devices
$breakpoint-2xl:  1536px  // 2X extra large devices
```

Usage:
```scss
.responsive-element {
  // Mobile-first: default styles for mobile
  font-size: $font-size-base;
  
  @include breakpoint-md {
    font-size: $font-size-lg;
  }
  
  @include breakpoint-lg {
    font-size: $font-size-xl;
  }
}
```

## Theme Switching

### CSS Variables

All design tokens are available as CSS custom properties for runtime theme switching:

```css
:root {
  --color-primary: oklch(0.64 0.22 334.61);
  --bg-primary: #ffffff;
  --fg-primary: #000000;
  /* ... more variables ... */
}

[data-theme='dark'] {
  --bg-primary: #0d0d0d;
  --fg-primary: #ffffff;
  /* ... theme overrides ... */
}
```

### Dynamic Theme in JavaScript

```javascript
// Set theme to dark
document.documentElement.setAttribute('data-theme', 'dark');

// Read current theme
const currentTheme = document.documentElement.getAttribute('data-theme');

// Using CSS variables in JS
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-primary');
```

## Accessibility Features

The SASS configuration includes built-in support for:

1. **Reduced Motion** - Disables animations for users with `prefers-reduced-motion`
2. **High Contrast** - Increases contrast for users with `prefers-contrast: more`
3. **Reduced Transparency** - Disables transparency effects for users with `prefers-reduced-transparency`

## Best Practices

1. **Use Variables**: Always use SASS variables for colors, spacing, and typography
2. **Import Mixins**: Use mixins from `_mixins.scss` for complex styles
3. **Component Classes**: Prefer pre-built component classes from `_components.scss`
4. **Mobile-First**: Design for mobile first, then use breakpoint mixins for larger screens
5. **Semantic Selectors**: Use meaningful class names that describe the content
6. **DRY Principle**: Don't repeat code - use mixins and variables
7. **Nesting**: Keep nesting 3 levels deep maximum for readability
8. **Organization**: Group related styles together within components

## Compilation Settings

SASS compilation is handled automatically by:
- **Vite**: For development and building (see `vite.config.ts`)
- **Next.js**: For app directory builds (see `next.config.ts`)

No additional SASS configuration is needed - it just works!

## Troubleshooting

### Styles Not Updating
- Clear `.next` or `dist` directories
- Restart development server
- Check that SCSS files are properly imported

### Import Errors
- Ensure paths use `@/` for absolute imports
- Check that partial files start with `_` (e.g., `_variables.scss`)
- Verify import statements have `.scss` extension

### Color Issues
- Use oklch color space for consistency
- Check for typos in variable names
- Use DevTools to inspect computed CSS custom properties

## Integration with Next.js

The SASS setup integrates seamlessly with Next.js:

1. **Server Components** can safely import SCSS files
2. **CSS Modules** are supported (use `.module.scss` extension)
3. **Tailwind CSS** can coexist with SASS (though we favor SASS here)
4. **PostCSS** automatically processes the compiled CSS

## Future Enhancements

Potential additions to the SASS system:
- Component library documentation generation
- Token export to JavaScript/JSON format
- CSS-in-JS integration for runtime theming
- Storybook integration for component showcase
- Automated SASS linting with stylelint

## References

- [SASS Documentation](https://sass-lang.com/documentation)
- [OKLCH Color Space](https://oklch.com/)
- [CSS Utility Classes](https://cssutility.com/)
- [Design Tokens](https://design-tokens.github.io/community-group/format/)
