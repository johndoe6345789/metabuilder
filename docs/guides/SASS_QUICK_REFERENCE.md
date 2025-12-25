# SASS Quick Reference Guide

## File Organization

```
src/
├── main.scss              # Main entry point (imported in app/layout.tsx)
├── index.scss             # Secondary stylesheet
└── styles/
    ├── theme.scss         # Theme definitions & CSS variables
    ├── _variables.scss    # All design tokens
    ├── _mixins.scss       # Reusable mixins
    ├── _base.scss         # Global styles & resets
    └── _components.scss   # Component classes & utilities
```

## Import Syntax (Modern SASS @use)

```scss
// At the top of your SCSS file
@use './styles/variables' as *;
@use './styles/mixins' as *;

// Now you can use variables and mixins
.my-component {
  color: $fg-primary;
  @include flex-center;
}
```

## Common Variables

### Colors
```scss
$color-primary          // Main purple
$color-primary-dark     // Darker purple
$color-primary-light    // Lighter purple
$color-success          // Green
$color-warning          // Yellow
$color-error            // Red
$color-info             // Blue
$color-neutral-50       // Light gray
$color-neutral-950      // Dark gray
```

### Spacing (8px base unit)
```scss
$space-1 through $space-24    // 4px to 96px
// Usage: padding: $space-4;  (16px)
```

### Typography
```scss
$font-family-body       // IBM Plex Sans
$font-family-heading    // Space Grotesk
$font-family-mono       // JetBrains Mono

$font-size-xs through $font-size-5xl    // 12px to 48px
$font-weight-light through $font-weight-bold
```

### Border Radius
```scss
$radius-sm              // 6px
$radius-md              // 8px
$radius-lg              // 12px
$radius-xl              // 16px
$radius-2xl             // 24px
$radius-full            // Circular
```

## Common Mixins

### Layout
```scss
@include flex-center;           // Center flex items
@include flex-between;          // Space-between flex
@include flex-column;           // Column flex layout
@include grid(3);               // 3-column grid
```

### Typography
```scss
@include heading-1 through @include heading-6;   // Heading styles
@include text-body;             // Normal body text
@include text-sm;               // Small text
@include truncate;              // Ellipsis
@include line-clamp(3);         // Multi-line ellipsis
```

### Components
```scss
@include btn-primary;           // Primary button
@include btn-secondary;         // Secondary button
@include card;                  // Card styling
@include input-base;            // Form input
@include badge;                 // Badge styling
```

### Responsive
```scss
@include breakpoint-sm { }      // 640px+
@include breakpoint-md { }      // 768px+
@include breakpoint-lg { }      // 1024px+
@include breakpoint-xl { }      // 1280px+
@include breakpoint-2xl { }     // 1536px+
```

### Utilities
```scss
@include elevation(2);          // Box shadow elevation
@include hardware-acceleration; // GPU acceleration
@include visually-hidden;       // Screen reader only
@include gradient($start, $end); // Gradient background
```

## Pre-built CSS Classes

### Buttons
```html
<button class="btn btn-primary btn-lg">Click me</button>
<button class="btn btn-secondary btn-sm">Small</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
```

### Cards
```html
<div class="card card-elevated">
  <div class="card-header">Title</div>
  <div class="card-body">Content</div>
  <div class="card-footer">Footer</div>
</div>
```

### Grid & Flex
```html
<div class="grid grid-cols-3 grid-gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<div class="flex flex-center gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Spacing Utilities
```html
<!-- Margin: mt, mb, ml, mr, mx, my, m -->
<div class="mt-8 mb-4">Margin top 2rem, margin bottom 1rem</div>

<!-- Padding: pt, pb, pl, pr, px, py, p -->
<div class="p-6">Padding 1.5rem all sides</div>

<!-- Numbers range from 0-24 (multiples of 4px) -->
<div class="mt-4 mb-8 px-12">Various spacing</div>
```

### Text Utilities
```html
<p class="text-primary">Colored text</p>
<p class="text-center">Centered text</p>
<p class="text-truncate">Single line ellipsis</p>
<p class="text-uppercase">UPPERCASE TEXT</p>
```

### Responsive Display
```html
<!-- Hidden on small screens, visible on medium+ -->
<div class="md:block hidden">Desktop only</div>

<!-- Visible on small screens, hidden on large+ -->
<div class="lg:hidden">Mobile only</div>

<!-- Grid responsive -->
<div class="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

## Accessibility Support

The SASS system respects user preferences:

```scss
// Automatically handles:
@media (prefers-reduced-motion: reduce) { }      // Disable animations
@media (prefers-contrast: more) { }              // High contrast mode
@media (prefers-reduced-transparency: reduce) { } // Reduce transparency
```

## Theme Switching with CSS Variables

All SASS variables are exposed as CSS custom properties:

```javascript
// Set dark theme
document.documentElement.setAttribute('data-theme', 'dark');

// Use in JavaScript
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-primary');
```

```css
/* Use in CSS */
.my-element {
  color: var(--fg-primary);
  background: var(--bg-secondary);
}
```

## Modern SASS Features Used

1. **@use with namespace** - Instead of @import
2. **color.change()** - For alpha values on modern colors
3. **Nesting** - Full support for nested selectors
4. **Variables** - $ prefix for all tokens
5. **Mixins** - @mixin and @include
6. **Functions** - SASS built-in color functions
7. **Loops** - @for loops for generating utilities
8. **Conditionals** - @if/@else for logic

## Example: Creating a Custom Component

```scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.my-card-component {
  @include card;
  padding: $space-6;
  
  &-title {
    @include heading-3;
    color: $color-primary;
    margin-bottom: $space-4;
  }
  
  &-content {
    @include text-body;
    color: $fg-secondary;
    line-height: $line-height-relaxed;
  }
  
  &:hover {
    @include elevation(3);
  }
  
  @include breakpoint-md {
    padding: $space-8;
    
    &-title {
      @include heading-2;
    }
  }
}
```

## Tips & Best Practices

1. **Always use variables** - Don't hardcode colors or spacing
2. **Use @use, not @import** - Modern SASS syntax
3. **Keep components small** - Under 100 lines of SCSS
4. **Use mixins for complexity** - Reduces duplication
5. **Mobile-first** - Start with mobile styles, add breakpoints for larger screens
6. **Test accessibility** - Use prefers-reduced-motion, prefers-contrast
7. **Leverage CSS variables** - For runtime theme changes
8. **Comment your code** - Especially complex SCSS logic

## Compilation

SASS is automatically compiled by:
- **Development**: `npm run dev` (Next.js dev server)
- **Build**: `npm run build` (Next.js production build)
- **Vite**: `npm run dev:vite` / `npm run build:vite`

No manual compilation needed!

## Resources

- [Full SASS Configuration Documentation](./SASS_CONFIGURATION.md)
- [SASS Language Reference](https://sass-lang.com/documentation)
- [Design Tokens Overview](../docs/SASS_CONFIGURATION.md)
