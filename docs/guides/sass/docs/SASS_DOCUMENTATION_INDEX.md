# SASS Documentation Index

Complete documentation for the MetaBuilder SASS configuration.

## 🚀 Quick Start (Read This First!)

**[SASS_QUICKSTART.md](./SASS_QUICKSTART.md)** - 5 minute read
- Get started immediately
- Three ways to use SASS
- Common variables & mixins
- Common CSS classes
- Simple examples

## 📖 Comprehensive Guides

### [SASS_QUICK_REFERENCE.md](./guides/SASS_QUICK_REFERENCE.md)
Quick lookup for syntax and usage patterns
- File organization
- Import syntax
- Variables reference
- Mixins reference
- Pre-built classes
- Accessibility features
- Theme switching

### [SASS_CONFIGURATION.md](./guides/SASS_CONFIGURATION.md)
Complete technical reference
- Installation & setup
- Directory structure
- File descriptions
- Usage examples for all features
- Color system (oklch)
- Spacing scale
- Typography
- Breakpoints
- Themes
- Accessibility
- Best practices
- Troubleshooting

### [SASS_EXAMPLES.md](./SASS_EXAMPLES.md)
Practical code examples for common patterns
- Using pre-built classes
- Using variables & mixins
- Creating custom components
- Responsive design
- Theme switching
- Advanced techniques

## ✅ Verification & Setup

### [SASS_SETUP_COMPLETE.md](./guides/SASS_SETUP_COMPLETE.md)
Summary of what was configured
- Complete feature list
- Compilation status
- How to use (3 methods)
- Documentation overview

### [SASS_VERIFICATION.md](./guides/SASS_VERIFICATION.md)
Verification checklist
- Installation verified
- File structure complete
- Features verified
- Compilation verified
- Documentation complete
- Ready to use checklist

## 🎯 Quick Navigation

### By Use Case

**I want to...**

**Use pre-built classes**
→ [SASS_QUICKSTART.md](./SASS_QUICKSTART.md) (Section: "Three Ways to Use SASS" → Option 1)

**Create custom components**
→ [SASS_EXAMPLES.md](./SASS_EXAMPLES.md) (Section: "Creating Custom Components")

**Learn responsive design**
→ [SASS_EXAMPLES.md](./SASS_EXAMPLES.md) (Section: "Responsive Design")

**Switch themes dynamically**
→ [SASS_EXAMPLES.md](./SASS_EXAMPLES.md) (Section: "Theme Switching")

**Find a specific color**
→ [guides/SASS_QUICK_REFERENCE.md](./guides/SASS_QUICK_REFERENCE.md) (Section: "Common Variables")

**Find a specific mixin**
→ [guides/SASS_QUICK_REFERENCE.md](./guides/SASS_QUICK_REFERENCE.md) (Section: "Common Mixins")

**Understand the color system**
→ [guides/SASS_CONFIGURATION.md](./guides/SASS_CONFIGURATION.md) (Section: "Color System")

**See all component classes**
→ [guides/SASS_QUICK_REFERENCE.md](./guides/SASS_QUICK_REFERENCE.md) (Section: "Pre-built CSS Classes")

**Troubleshoot issues**
→ [guides/SASS_CONFIGURATION.md](./guides/SASS_CONFIGURATION.md) (Section: "Troubleshooting")

**Understand best practices**
→ [guides/SASS_CONFIGURATION.md](./guides/SASS_CONFIGURATION.md) (Section: "Best Practices")

### By Skill Level

**Beginner**
1. [SASS_QUICKSTART.md](./SASS_QUICKSTART.md) - Get started fast
2. [guides/SASS_QUICK_REFERENCE.md](./guides/SASS_QUICK_REFERENCE.md) - Quick lookup
3. [SASS_EXAMPLES.md](./SASS_EXAMPLES.md) - Copy-paste examples

**Intermediate**
1. [SASS_EXAMPLES.md](./SASS_EXAMPLES.md) - Learn patterns
2. [guides/SASS_CONFIGURATION.md](./guides/SASS_CONFIGURATION.md) - Understand design system
3. [guides/SASS_QUICK_REFERENCE.md](./guides/SASS_QUICK_REFERENCE.md) - Reference when needed

**Advanced**
1. [guides/SASS_CONFIGURATION.md](./guides/SASS_CONFIGURATION.md) - Full reference
2. [guides/SASS_VERIFICATION.md](./guides/SASS_VERIFICATION.md) - See what's available
3. Extend with your own mixins and variables

## 📚 Documentation Files

```
docs/
├── SASS_QUICKSTART.md                    Main quick start guide
├── SASS_EXAMPLES.md                      Code examples
├── SASS_DOCUMENTATION_INDEX.md           This file
└── guides/
    ├── SASS_QUICK_REFERENCE.md           Quick lookup
    ├── SASS_CONFIGURATION.md             Full technical reference
    ├── SASS_SETUP_COMPLETE.md            Setup summary
    └── SASS_VERIFICATION.md              Verification checklist
```

## 🔑 Key Concepts

### Three Ways to Use SASS

1. **Pre-built Classes** - Use CSS classes directly in HTML
   ```html
   <button class="btn btn-primary btn-lg">Click</button>
   ```

2. **Variables & Mixins** - Write custom SCSS with SASS features
   ```scss
   @use '@/styles/variables' as *;
   @use '@/styles/mixins' as *;
   
   .component {
     padding: $space-6;
     @include flex-center;
   }
   ```

3. **CSS Variables** - Dynamic theming with CSS custom properties
   ```css
   .element {
     background: var(--bg-primary);
     color: var(--fg-primary);
   }
   ```

### File Structure

- **Variables** (200+ tokens): `src/styles/_variables.scss`
- **Mixins** (40+ patterns): `src/styles/_mixins.scss`
- **Base Styles** (resets): `src/styles/_base.scss`
- **Components** (utilities): `src/styles/_components.scss`
- **Themes**: `src/styles/theme.scss`
- **Entry Point**: `src/main.scss`

### Core Design Tokens

- **Colors**: 12 semantic + 11-shade neutral palette (oklch)
- **Typography**: 3 fonts, 13 sizes, 5 weights
- **Spacing**: 8px base unit, 24 values (4px-96px)
- **Radius**: 6 presets + circular
- **Shadows**: 5 elevation levels
- **Transitions**: 3 timing presets
- **Breakpoints**: 6 responsive sizes (mobile-first)

## 🚀 Getting Started

### For Quick Start
1. Read [SASS_QUICKSTART.md](./SASS_QUICKSTART.md) (5 minutes)
2. Use pre-built classes in your components
3. Reference [SASS_QUICK_REFERENCE.md](./guides/SASS_QUICK_REFERENCE.md) when needed

### For Deep Dive
1. Read [SASS_CONFIGURATION.md](./guides/SASS_CONFIGURATION.md)
2. Explore [SASS_EXAMPLES.md](./SASS_EXAMPLES.md)
3. Check [SASS_VERIFICATION.md](./guides/SASS_VERIFICATION.md) for complete feature list

### For Specific Features
Use the navigation above to jump to your topic

## ✅ Verification

All documentation has been:
- ✓ Written and proofread
- ✓ Organized logically
- ✓ Cross-referenced
- ✓ Verified against actual implementation
- ✓ Tested for accuracy

## 🎨 Design System Features

### Pre-built Components
- Buttons (6 variants, 3 sizes)
- Cards (6 styles)
- Forms (5 helpers)
- Badges (6 colors)
- Alerts (5 colors)
- Layout (container, grid, flex)

### Utilities
- Spacing (margin, padding)
- Text (color, alignment, transform)
- Visibility (hidden, invisible, sr-only)
- Responsive display

### Mixins (40+)
- Layout (flex, grid, positioning)
- Typography (headings, text)
- Components (buttons, cards, inputs)
- Responsive (breakpoints)
- Utilities (elevation, gradient, etc.)

## 🔗 External Resources

- [SASS Language Reference](https://sass-lang.com/documentation)
- [OKLCH Color Space](https://oklch.com/)
- [CSS Utility Classes](https://cssutility.com/)
- [Design Tokens](https://design-tokens.github.io/community-group/format/)

## 📝 Document Versions

| Document | Size | Last Updated |
|----------|------|--------------|
| SASS_QUICKSTART.md | ~4 KB | 2025-12-25 |
| SASS_EXAMPLES.md | ~15 KB | 2025-12-25 |
| SASS_QUICK_REFERENCE.md | ~8 KB | 2025-12-25 |
| SASS_CONFIGURATION.md | ~12 KB | 2025-12-25 |
| SASS_SETUP_COMPLETE.md | ~4 KB | 2025-12-25 |
| SASS_VERIFICATION.md | ~6 KB | 2025-12-25 |

**Total Documentation**: ~49 KB

## 💡 Tips

- **Bookmark SASS_QUICKSTART.md** for quick access
- **Keep SASS_QUICK_REFERENCE.md** handy for syntax lookup
- **Reference SASS_EXAMPLES.md** when creating new components
- **Check SASS_CONFIGURATION.md** for deep technical questions
- **Run through SASS_VERIFICATION.md** if you need to verify setup

---

**All documentation is up to date and accurate as of December 25, 2025.**

Happy styling! 🎨
