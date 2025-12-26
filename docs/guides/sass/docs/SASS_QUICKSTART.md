# SASS Quick Start for Developers

## 30-Second Setup

SASS is already configured! Just start using it.

## Three Ways to Use SASS

### 1. Use Pre-built Classes (Easiest)

```html
<!-- Buttons -->
<button class="btn btn-primary btn-lg">Submit</button>

<!-- Cards -->
<div class="card card-elevated p-6">
  <h2 class="heading-3 mb-4">Title</h2>
  <p class="text-body">Content here</p>
</div>

<!-- Layout -->
<div class="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Spacing -->
<div class="mt-8 mb-4 px-6">Margins and padding</div>

<!-- Responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

### 2. Use Variables & Mixins

```scss
// MyComponent.module.scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.container {
  padding: $space-6;
  background: $bg-primary;
  @include card;
  
  &:hover {
    @include elevation(3);
  }
}

.title {
  @include heading-3;
  color: $color-primary;
  margin-bottom: $space-4;
}

.button {
  @include btn-primary;
}

// Responsive
.grid {
  @include grid(1);
  
  @include breakpoint-md {
    @include grid(2);
  }
  
  @include breakpoint-lg {
    @include grid(3);
  }
}
```

### 3. Use CSS Variables

```css
.element {
  background-color: var(--bg-primary);
  color: var(--fg-primary);
  font-family: var(--font-family-body);
  padding: var(--space-4);
}
```

## Common Variables

```scss
// Colors
$color-primary          // Main color
$color-success          // Green
$color-warning          // Yellow  
$color-error            // Red
$color-neutral-100      // Light gray
$color-neutral-950      // Dark gray

// Spacing (multiples of 4px)
$space-1 through $space-24    // 4px to 96px

// Typography
$font-family-body       // IBM Plex Sans
$font-family-heading    // Space Grotesk
$font-size-base         // 16px
$font-size-lg           // 18px
$font-size-2xl          // 24px

// Border Radius
$radius-md              // 8px
$radius-lg              // 12px
$radius-full            // Circular
```

## Common Mixins

```scss
// Layout
@include flex-center;           // Center items
@include flex-between;          // Space between
@include grid(3);               // 3-column grid

// Typography
@include heading-3;             // H3 style
@include text-body;             // Body text
@include text-sm;               // Small text

// Responsive
@include breakpoint-md { }      // 768px+
@include breakpoint-lg { }      // 1024px+

// Components
@include btn-primary;           // Button
@include card;                  // Card
@include elevation(2);          // Shadow
```

## Common Classes

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Delete</button>

<!-- Sizing -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-md">Medium</button>
<button class="btn btn-lg">Large</button>

<!-- Cards -->
<div class="card">
  <div class="card-header">Title</div>
  <div class="card-body">Content</div>
  <div class="card-footer">Footer</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">Column layout</div>

<!-- Flex -->
<div class="flex flex-center gap-4">Centered</div>
<div class="flex flex-between">Left | Right</div>

<!-- Spacing: mt/mb/ml/mr/mx/my/m (0-24) -->
<div class="mt-4 mb-8 p-6">Margins & padding</div>

<!-- Text -->
<p class="text-primary">Colored text</p>
<p class="text-center">Centered</p>
<p class="text-uppercase">UPPERCASE</p>

<!-- Responsive -->
<div class="hidden md:block">Desktop only</div>
<div class="lg:hidden">Mobile only</div>
```

## Theme Switching

```javascript
// Dark theme
document.documentElement.setAttribute('data-theme', 'dark')

// Light theme  
document.documentElement.removeAttribute('data-theme')

// Check current theme
const theme = document.documentElement.getAttribute('data-theme')
```

## Creating a Component

```scss
// components/MyCard.module.scss
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.card {
  @include card;
  padding: $space-6;
  
  &:hover {
    @include elevation(3);
  }
}

.header {
  @include heading-4;
  color: $color-primary;
  margin-bottom: $space-4;
  border-bottom: 1px solid $color-neutral-200;
  padding-bottom: $space-4;
}

.content {
  @include text-body;
  color: $fg-secondary;
  margin-bottom: $space-6;
}

.footer {
  @include flex-between;
  gap: $space-4;
  border-top: 1px solid $color-neutral-200;
  padding-top: $space-4;
}

// Responsive
@include breakpoint-md {
  .card {
    padding: $space-8;
  }
  
  .header {
    @include heading-3;
  }
}
```

```tsx
// components/MyCard.tsx
import styles from './MyCard.module.scss'

export function MyCard({ title, children, onAction }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.header}>{title}</h3>
      <p className={styles.content}>{children}</p>
      <div className={styles.footer}>
        <button className="btn btn-secondary">Cancel</button>
        <button className="btn btn-primary" onClick={onAction}>
          Confirm
        </button>
      </div>
    </div>
  )
}
```

## Responsive Layout Pattern

```scss
// Mobile-first: default to 1 column
.grid {
  @include grid(1);
  gap: $space-4;
  padding: $space-4;
}

// Tablet: 2 columns
@include breakpoint-md {
  .grid {
    @include grid(2);
    gap: $space-6;
    padding: $space-6;
  }
}

// Desktop: 3 columns
@include breakpoint-lg {
  .grid {
    @include grid(3);
    gap: $space-8;
    padding: $space-8;
  }
}
```

## Import SCSS in Your Files

```scss
// Always at the top of your SCSS files
@use '@/styles/variables' as *;      // For colors, spacing, fonts
@use '@/styles/mixins' as *;         // For layout, typography, components

// Then use them
.myClass {
  color: $fg-primary;
  @include flex-center;
  padding: $space-4;
}
```

## File Structure

```
src/styles/
├── _variables.scss    ← Colors, spacing, typography, etc.
├── _mixins.scss       ← Reusable style mixins
├── _base.scss         ← Global styles & resets
├── _components.scss   ← Pre-built component classes
└── theme.scss         ← Theme definitions & CSS variables

src/
├── main.scss          ← Entry point (imports all above)
└── index.scss         ← Secondary stylesheet
```

## Need More Help?

- **Quick reference**: [SASS_QUICK_REFERENCE.md](../guides/SASS_QUICK_REFERENCE.md)
- **Full documentation**: [SASS_CONFIGURATION.md](../guides/SASS_CONFIGURATION.md)
- **Code examples**: [SASS_EXAMPLES.md](../SASS_EXAMPLES.md)

## Key Points

✓ Use variables for colors, spacing, typography  
✓ Use mixins for layout and component patterns  
✓ Use pre-built classes for common components  
✓ Mobile-first: style mobile, then add breakpoints  
✓ Leverage CSS variables for dynamic theming  
✓ Check documentation for complete reference  

---

**That's it! You're ready to use SASS. Happy styling! 🎨**
