# SASS Usage Examples

This document provides practical examples of how to use the SASS system in MetaBuilder.

## Table of Contents

1. [Using Pre-built Classes](#using-pre-built-classes)
2. [Using Variables & Mixins](#using-variables--mixins)
3. [Creating Custom Components](#creating-custom-components)
4. [Responsive Design](#responsive-design)
5. [Theme Switching](#theme-switching)
6. [Advanced Techniques](#advanced-techniques)

---

## Using Pre-built Classes

### Buttons

```html
<!-- Primary button (large) -->
<button class="btn btn-primary btn-lg">Submit</button>

<!-- Secondary button (medium) -->
<button class="btn btn-secondary btn-md">Cancel</button>

<!-- Danger button (small) -->
<button class="btn btn-danger btn-sm">Delete</button>

<!-- Success button (block/full width) -->
<button class="btn btn-success btn-block">Confirm</button>

<!-- Icon button (circular) -->
<button class="btn btn-primary btn-icon">
  <svg>...</svg>
</button>
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h2>Card Title</h2>
  </div>
  
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Elevated card -->
<div class="card card-elevated">
  Content with shadow
</div>

<!-- Compact card -->
<div class="card card-compact">
  <p>Smaller padding</p>
</div>
```

### Forms

```html
<form>
  <div class="form-group">
    <label class="form-label">Email Address</label>
    <input type="email" placeholder="user@example.com" />
    <span class="form-help">We'll never share your email.</span>
  </div>
  
  <div class="form-group">
    <label class="form-label">Password</label>
    <input type="password" />
    <span class="form-error">Password is required.</span>
  </div>
  
  <div class="form-group">
    <label class="form-label">Confirm Password</label>
    <input type="password" />
    <span class="form-success">Passwords match!</span>
  </div>
  
  <button class="btn btn-primary btn-block">Sign In</button>
</form>
```

### Badges

```html
<!-- Default badge -->
<span class="badge">New</span>

<!-- Color variants -->
<span class="badge badge-primary">Featured</span>
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Offline</span>
<span class="badge badge-info">Info</span>
```

### Alerts

```html
<!-- Info alert -->
<div class="alert alert-info">
  <strong class="alert-title">Heads up!</strong>
  <p class="alert-message">This is an informational message.</p>
</div>

<!-- Success alert -->
<div class="alert alert-success">
  <strong>Success!</strong> Your changes have been saved.
</div>

<!-- Warning alert -->
<div class="alert alert-warning">
  <strong>Warning:</strong> Please review your input.
</div>

<!-- Danger alert -->
<div class="alert alert-danger">
  <strong>Error!</strong> Something went wrong. Please try again.
</div>
```

### Spacing Utilities

```html
<!-- Margin utilities -->
<div class="mt-4 mb-8">Margin top 1rem, margin bottom 2rem</div>

<!-- Padding utilities -->
<div class="p-6">Padding 1.5rem all sides</div>

<!-- Responsive spacing -->
<div class="p-4 md:p-6 lg:p-8">
  Padding 1rem (mobile), 1.5rem (tablet), 2rem (desktop)
</div>

<!-- Margin horizontal (left/right) -->
<div class="mx-auto">Centered horizontally</div>
```

### Text Utilities

```html
<!-- Text colors -->
<p class="text-primary">Primary color text</p>
<p class="text-success">Success message</p>
<p class="text-danger">Error message</p>
<p class="text-muted">Muted text</p>

<!-- Text alignment -->
<p class="text-left">Left aligned</p>
<p class="text-center">Centered</p>
<p class="text-right">Right aligned</p>

<!-- Text transformation -->
<p class="text-uppercase">UPPERCASE</p>
<p class="text-lowercase">lowercase</p>
<p class="text-capitalize">Capitalized</p>

<!-- Text truncate -->
<p class="text-truncate">
  This very long text will be cut off with an ellipsis...
</p>
```

### Grid & Flex Layout

```html
<!-- Simple grid (3 columns) -->
<div class="grid grid-cols-3 gap-4">
  <div class="card">Column 1</div>
  <div class="card">Column 2</div>
  <div class="card">Column 3</div>
</div>

<!-- Flex with space-between -->
<div class="flex flex-between">
  <div>Left item</div>
  <div>Right item</div>
</div>

<!-- Flex centered -->
<div class="flex flex-center">
  <span>Centered content</span>
</div>

<!-- Flex column -->
<div class="flex flex-column gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Responsive Display

```html
<!-- Hidden on small screens, visible on medium+ -->
<div class="md:block hidden">
  Desktop navigation
</div>

<!-- Visible on small screens, hidden on large+ -->
<div class="lg:hidden">
  Mobile menu
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="card">Item</div>
  <!-- Repeats... -->
</div>

<!-- Responsive text size -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">
  Responsive heading
</h1>
```

---

## Using Variables & Mixins

### In React Components with CSS Modules

```scss
// MyComponent.module.scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.container {
  padding: $space-6;
  background-color: $bg-primary;
  border-radius: $radius-lg;
  @include elevation(2);
}

.title {
  @include heading-3;
  color: $color-primary;
  margin-bottom: $space-4;
}

.description {
  @include text-body;
  color: $fg-secondary;
  line-height: $line-height-relaxed;
}

.buttonGroup {
  @include flex-between;
  gap: $space-4;
  margin-top: $space-6;
}

.button {
  @include btn-primary;
  
  &:hover {
    @include elevation(3);
  }
}
```

```tsx
// MyComponent.tsx
import styles from './MyComponent.module.scss'

export function MyComponent() {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Card Title</h3>
      <p className={styles.description}>Card description</p>
      <div className={styles.buttonGroup}>
        <button className={styles.button}>Action</button>
      </div>
    </div>
  )
}
```

### Standalone SCSS File

```scss
// styles/dashboard.scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.dashboard {
  @include grid(4);
  gap: $space-6;
  padding: $space-8;
  background-color: $bg-secondary;
  min-height: 100vh;
}

.dashboardCard {
  @include card;
  padding: $space-6;
  
  &:hover {
    @include elevation(3);
  }
  
  @include breakpoint-md {
    @include grid(2);
  }
  
  @include breakpoint-sm {
    @include grid(1);
  }
}

.cardTitle {
  @include heading-4;
  color: $color-primary;
  margin-bottom: $space-4;
}

.cardValue {
  @include text-xl;
  font-weight: $font-weight-bold;
  color: $fg-primary;
  margin-bottom: $space-2;
}

.cardMetric {
  @include text-sm;
  color: $fg-secondary;
}
```

---

## Creating Custom Components

### Form Input Component

```scss
// styles/components/_form-input.scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.formInput {
  @include input-base;
  
  &-wrapper {
    margin-bottom: $space-6;
  }
  
  &-label {
    display: block;
    margin-bottom: $space-2;
    font-weight: $font-weight-medium;
    color: $fg-primary;
  }
  
  &-helper {
    display: block;
    margin-top: $space-1;
    font-size: $font-size-xs;
    color: $fg-tertiary;
  }
  
  &.error {
    border-color: $color-error;
    
    .formInput-helper {
      color: $color-error;
    }
  }
  
  &.success {
    border-color: $color-success;
    
    .formInput-helper {
      color: $color-success;
    }
  }
}
```

### Data Table Component

```scss
// styles/components/_data-table.scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.dataTable {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: $space-6;
  
  &-header {
    background-color: $color-neutral-100;
    
    th {
      padding: $space-4;
      text-align: left;
      font-weight: $font-weight-semibold;
      color: $fg-primary;
      border-bottom: 2px solid $color-neutral-300;
    }
  }
  
  &-body {
    tr {
      transition: background-color $transition-base;
      
      &:hover {
        background-color: $color-neutral-50;
      }
      
      &:nth-child(even) {
        background-color: $color-neutral-50;
      }
    }
    
    td {
      padding: $space-4;
      border-bottom: 1px solid $color-neutral-200;
      color: $fg-primary;
    }
  }
}
```

### Modal Overlay Component

```scss
// styles/components/_modal.scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.modalBackdrop {
  @include position-absolute(0, 0, 0, 0);
  background-color: color.change(#000000, $alpha: 0.5);
  z-index: $z-modal-backdrop;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background-color: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-2xl;
  z-index: $z-modal;
  padding: $space-8;
  max-width: 500px;
  width: 90%;
  
  @include breakpoint-md {
    width: 100%;
  }
  
  &-header {
    margin-bottom: $space-6;
    border-bottom: 1px solid $color-neutral-200;
    padding-bottom: $space-4;
    
    h2 {
      margin: 0;
      @include heading-2;
    }
  }
  
  &-body {
    margin-bottom: $space-6;
  }
  
  &-footer {
    @include flex-between;
    gap: $space-4;
    border-top: 1px solid $color-neutral-200;
    padding-top: $space-4;
  }
}
```

---

## Responsive Design

### Mobile-First Approach

```scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.responsiveLayout {
  // Mobile-first: default to 1 column
  @include grid(1);
  gap: $space-4;
  padding: $space-4;
  
  // Tablet: 2 columns
  @include breakpoint-md {
    @include grid(2);
    gap: $space-6;
    padding: $space-6;
  }
  
  // Desktop: 3 columns
  @include breakpoint-lg {
    @include grid(3);
    gap: $space-8;
    padding: $space-8;
  }
  
  // Large desktop: 4 columns
  @include breakpoint-xl {
    @include grid(4);
  }
}

.responsiveText {
  // Mobile: small font
  font-size: $font-size-base;
  padding: $space-4;
  
  // Tablet: medium font
  @include breakpoint-md {
    font-size: $font-size-lg;
    padding: $space-6;
  }
  
  // Desktop: large font
  @include breakpoint-lg {
    font-size: $font-size-xl;
    padding: $space-8;
  }
}

.responsiveImage {
  max-width: 100%;
  height: auto;
  
  @include breakpoint-md {
    border-radius: $radius-lg;
    @include elevation(2);
  }
  
  @include breakpoint-lg {
    border-radius: $radius-2xl;
    @include elevation(3);
  }
}
```

---

## Theme Switching

### In JavaScript

```javascript
// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'dark')

// Switch to light theme
document.documentElement.removeAttribute('data-theme')
// or
document.documentElement.setAttribute('data-theme', 'light')

// Get current theme
const currentTheme = document.documentElement.getAttribute('data-theme')

// Check system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (prefersDark) {
  document.documentElement.setAttribute('data-theme', 'dark')
}
```

### In React

```tsx
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
  }, [theme])
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
```

### Using CSS Variables

```css
.themeAwareElement {
  background-color: var(--bg-primary);
  color: var(--fg-primary);
  font-family: var(--font-family-body);
  transition: background-color var(--transition-base);
}

.themeAwareBorder {
  border-color: var(--color-neutral-300);
}

[data-theme='dark'] .themeAwareBorder {
  border-color: var(--color-neutral-700);
}
```

---

## Advanced Techniques

### Extending Mixins

```scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// Custom button with additional styling
@mixin btn-custom {
  @include btn-primary;
  border-radius: $radius-full;
  padding: $space-3 $space-6;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.customButton {
  @include btn-custom;
}
```

### Creating Color Variants

```scss
@use '@/styles/variables' as *;

@mixin card-variant($bg-color, $border-color) {
  background-color: $bg-color;
  border: 2px solid $border-color;
  padding: $space-6;
  border-radius: $radius-lg;
}

.card-success {
  @include card-variant(
    oklch(0.93 0.12 149.47),  // Light green
    $color-success
  );
}

.card-warning {
  @include card-variant(
    oklch(0.95 0.15 70.08),   // Light yellow
    $color-warning
  );
}

.card-error {
  @include card-variant(
    oklch(0.92 0.2 25.39),    // Light red
    $color-error
  );
}
```

### Dynamic Spacing Loop

```scss
@use '@/styles/variables' as *;

// Create responsive spacing utilities
.spacing {
  @for $i from 1 through 6 {
    $value: $space-4 * $i;
    
    &-#{$i} {
      padding: $value;
    }
    
    @include breakpoint-md {
      &-md-#{$i} {
        padding: $value * 1.5;
      }
    }
    
    @include breakpoint-lg {
      &-lg-#{$i} {
        padding: $value * 2;
      }
    }
  }
}
```

### Conditional Color Adjustments

```scss
@use 'sass:color' as *;
@use '@/styles/variables' as *;

.accentElement {
  background-color: $color-primary;
  
  @media (prefers-contrast: more) {
    // Increase contrast for high contrast mode
    background-color: change-color($color-primary, $lightness: 40%);
    color: #ffffff;
  }
}
```

---

## Best Practices

✓ Always use variables instead of hardcoded values  
✓ Use mixins for frequently used patterns  
✓ Keep components responsive with breakpoint mixins  
✓ Test color accessibility  
✓ Use CSS variables for runtime theme switching  
✓ Document custom mixins and variables  
✓ Keep nesting 3 levels deep maximum  
✓ Use meaningful class names  

---

See [SASS_CONFIGURATION.md](./SASS_CONFIGURATION.md) for comprehensive reference.
