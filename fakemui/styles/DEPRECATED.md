# DEPRECATED: Legacy Styles

> **This folder is deprecated.** New components should use the M3 token system.

## Migration Guide

The styles in this folder use legacy CSS custom properties (`--color-*`, `--spacing-*`) that are **not** part of the Material Design 3 specification.

### New Architecture

All FakeMUI components should now use:

1. **`scss/theme.scss`** - Generates official M3 CSS custom properties (`--mat-sys-*`) from Google's Angular Material M3 SCSS
2. **`components/_tokens.scss`** - SCSS variables that reference M3 CSS custom properties
3. **`scss/m3-scss/`** - Official Google Angular Material M3 SCSS source

### Token Mapping

| Legacy Token | M3 Token |
|--------------|----------|
| `--color-primary` | `--mat-sys-primary` |
| `--color-text` | `--mat-sys-on-surface` |
| `--color-bg` | `--mat-sys-surface` |
| `--color-border` | `--mat-sys-outline` |
| `--spacing-*` | Use fixed values (4px, 8px, 12px, 16px, 24px, 32px) |
| `--radius-*` | `--mat-sys-corner-*` |
| `--shadow-*` | `--mat-sys-level*` |

### Migration Steps

1. Replace `@use '../styles/variables'` with `@use '../_tokens' as m3`
2. Update color references: `var(--color-primary)` → `m3.$primary`
3. Update shape references: `var(--radius-md)` → `m3.$corner-medium`
4. Use the typography mixin: `@include m3.typography(label-large)`

### Files to Migrate

Components still using legacy styles should be refactored to use the M3 system:

- `styles/atoms/` - Flat selector styles (can be removed after component migration)
- `styles/mixins/` - Custom mixins (replaced by M3 patterns)
- `styles/global/` - Global resets (keep as-is if needed)

### Example Migration

**Before (Legacy):**
```scss
@use '../styles/variables';

.button {
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

**After (M3):**
```scss
@use '../_tokens' as m3;

.button {
  background: m3.$primary;
  border-radius: m3.$corner-full;
  padding: 0 24px;
  @include m3.typography(label-large);
}
```
