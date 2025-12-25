# Styles (`src/styles/`)

Global and component-specific stylesheets using SCSS.

## Structure

```
styles/
├── variables.scss       # Design tokens and CSS variables
├── mixins.scss          # SCSS mixins and utilities
├── themes.scss          # Theme definitions
├── global.scss          # Global styles
└── components/          # Component-scoped styles
    ├── buttons.scss
    ├── forms.scss
    └── ...
```

## Design Tokens

### Colors

- Primary: Purple/Accent
- Secondary: Supporting colors
- Neutral: Grays

### Typography

- **Body**: IBM Plex Sans (14px/1.6 line-height)
- **Headings**: Space Grotesk (bold)
- **Code**: JetBrains Mono (monospace)

### Spacing

Uses 8px base unit:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## Usage

Import in components:

```scss
@import '@/styles/variables';
@import '@/styles/mixins';

.my-component {
  @include flex-center;
  padding: var(--spacing-md);
  background: var(--primary-color);
}
```

## Theming

Themes are defined in `theme.json` with CSS variables injected at runtime for dynamic switching.

See `/docs/` for detailed styling guidelines.
