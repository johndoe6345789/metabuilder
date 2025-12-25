# Styling System

## Overview
Global styles, themes, and Tailwind CSS configuration for the application.

## Location
[/src/styles/](/src/styles/)

## Style Files

### Main Styles
Located in `/src/`:
- `index.scss` - Global style initialization
- `main.scss` - Main stylesheet with Tailwind directives

### Theme Configuration
- Theme definitions in `/theme.json`
- CSS variables for color palette
- Font configuration: IBM Plex Sans (body), Space Grotesk (headings), JetBrains Mono (code)

### Color Scheme
- Primary theme: Purple/accent
- Color space: OKLCH
- See [/theme.json](/theme.json) for complete palette

## Tailwind CSS
The application uses Tailwind CSS exclusively for utility-based styling. Configuration is in `tailwind.config.ts`.

## Component Styling
All components should use Tailwind utility classes:

```tsx
<div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg">
  Styled with Tailwind
</div>
```

## Related Documentation
- [Component Architecture](/docs/architecture)
- [Theme Configuration](/theme.json)
