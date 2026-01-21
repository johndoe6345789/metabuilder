# Accessibility & Testing Improvements

## Overview
This document summarizes all accessibility enhancements and data-testid attributes added to the CodeSnippet application. These improvements make the application more accessible to screen reader users and easier to test programmatically.

---

## Navigation Components

### Navigation.tsx
- **Added:** `aria-expanded` - Indicates navigation menu state
- **Added:** `aria-controls="navigation-sidebar"` - Links button to controlled element
- **Added:** `data-testid="navigation-toggle-btn"` - Test identifier for menu toggle
- **Added:** `aria-hidden="true"` to icon - Hides decorative icon from screen readers

### NavigationSidebar.tsx
✅ **Already had:** `data-testid` attributes on overlay and sidebar
- **Added:** `id="navigation-sidebar"` - Enables aria-controls reference
- **Added:** `role="navigation"` - Explicit semantic role
- **Added:** `aria-label="Main navigation menu"` - Descriptive label
- **Navigation items:** `data-testid={`nav-link-${item.path.replace(/\//g, '-')}`}` for dynamic test IDs
- **Sidebar close button:** `data-testid="navigation-sidebar-close-btn"`

### PageLayout.tsx
- **Added:** `data-testid="page-layout"` to main container
- **Added:** `data-testid="page-header"` to header element
- **Added:** `data-testid="logo-text"` to logo
- **Added:** `data-testid="main-content"` to main element
- **Added:** `aria-hidden="true"` to decorative grid-pattern

---

## Snippet Manager Components

### SnippetManagerRedux.tsx
- **Added:** `data-testid="snippet-manager"` to main container
- **Added:** `data-testid="snippet-manager-loading"` to loading state

### SnippetToolbar.tsx
✅ **Already had:** Comprehensive data-testid and aria attributes
- **Enhanced:** Added `data-testid` for template menu items:
  - `snippet-template-react-${template.id}`
  - `snippet-template-python-${template.id}`
  - `snippet-template-javascript-${template.id}`
- **Already present:**
  - `data-testid="snippet-search-input"` with `aria-label`
  - `data-testid="snippet-selection-mode-btn"` with `aria-pressed`
  - `data-testid="snippet-create-menu-trigger"`

### SnippetCard.tsx
✅ **Already had:** `data-testid={`snippet-card-${snippet.id}`}` and `role="article"`

### SnippetCardActions.tsx
✅ **Already had:** Comprehensive data-testid attributes:
- `snippet-card-view-btn`
- `snippet-card-copy-btn`
- `snippet-card-edit-btn`
- `snippet-card-actions-menu` (three-dot menu)
- `snippet-card-move-submenu`
- `move-to-namespace-${namespace.id}`
- `snippet-card-delete-btn`
- All buttons have appropriate `aria-label` attributes

### SelectionControls.tsx
- **Added:** `data-testid="selection-controls"` to main container
- **Added:** `data-testid="select-all-btn"` with `aria-label`
- **Added:** `data-testid="selection-count"` to count display
- **Added:** `data-testid="bulk-move-menu-trigger"` with `aria-label`
- **Added:** `data-testid="bulk-move-menu"` to menu container
- **Added:** `data-testid={`bulk-move-to-namespace-${namespace.id}`}` for menu items
- **Added:** `aria-hidden="true"` to folder icon

### SnippetGrid.tsx
✅ **Already had:** `data-testid="snippet-grid"` with `role="region"` and `aria-label`

### NamespaceSelector.tsx
✅ **Already had:** Comprehensive data-testid:
- `namespace-selector-trigger`
- `namespace-selector-content`
- `namespace-option-${namespace.id}`

---

## Form Components

### SnippetFormFields.tsx
✅ **Already had:** Excellent accessibility implementation:
- **Title input:**
  - `data-testid="snippet-title-input"`
  - `aria-invalid={!!errors.title}`
  - `aria-describedby="title-error"` (when error present)
- **Language select:**
  - `data-testid="snippet-language-select"` with `aria-label`
  - `data-testid="snippet-language-options"` on content
  - `data-testid={`language-option-${lang}`}` on items
- **Description textarea:**
  - `data-testid="snippet-description-textarea"`
  - `aria-label="Snippet description"`

### SnippetDialog.tsx
✅ **Already had:**
- `data-testid="snippet-dialog"` on DialogContent
- `data-testid="snippet-dialog-cancel-btn"`
- `data-testid="snippet-dialog-save-btn"`

### SnippetViewer.tsx
- **Added:** `data-testid="snippet-viewer-dialog"` on DialogContent

### SnippetViewerHeader.tsx
- **Added:** `data-testid="snippet-viewer-toggle-preview-btn"` with `aria-pressed` and `aria-label`
- **Added:** `data-testid="snippet-viewer-copy-btn"` with descriptive `aria-label`
- **Added:** `data-testid="snippet-viewer-edit-btn"` with `aria-label`
- **Added:** `aria-hidden="true"` to all icons

---

## UI Primitive Components

### button.tsx
✅ **Passes through all props** - Supports data-testid and accessibility attributes

### input.tsx
✅ **Passes through all props** - Supports data-testid and accessibility attributes

### dialog.tsx
- **DialogOverlay:**
  - **Added:** `aria-hidden="true"` - Hides scrim from accessibility tree
  - **Added:** `data-testid="dialog-overlay"` - Test identifier
- **DialogContent close button:**
  - **Enhanced:** `aria-label="Close dialog"` (more descriptive)
  - **Added:** `data-testid="dialog-close-btn"`

### sonner.tsx (Toast component)
- **Added:** `data-testid="toast-container"` to Toaster component
- **Added:** `position="bottom-right"` for consistent positioning
- ✅ Sonner library automatically manages `aria-live` and `role="status"` on toast notifications

---

## Accessibility Patterns Implemented

### ARIA Attributes
| Attribute | Component | Purpose |
|-----------|-----------|---------|
| `aria-label` | Multiple | Provides accessible name for buttons and regions |
| `aria-expanded` | Navigation toggle | Indicates menu open/closed state |
| `aria-pressed` | Toggle buttons | Indicates pressed state for toggles |
| `aria-hidden` | Decorative elements | Hides non-semantic elements from screen readers |
| `aria-controls` | Navigation button | Links trigger to controlled element |
| `aria-modal` | Dialog | Marks dialog as modal |
| `role="dialog"` | Dialog container | Semantic dialog role |
| `aria-describedby` | Form inputs | Links errors to input fields |
| `aria-invalid` | Form inputs | Marks invalid form fields |
| `aria-label` | Regions | Descriptive labels for landmark regions |

### Semantic HTML
- ✅ `<nav>` - Navigation sections
- ✅ `<main>` - Main content area
- ✅ `<header>` - Page header
- ✅ `<footer>` - Page footer
- ✅ `<aside>` - Sidebar (if present)
- ✅ `<article>` - Snippet cards
- ✅ `role="region"` - Content grids

---

## Testing Identifiers (data-testid)

### Navigation
```
- navigation-toggle-btn
- navigation-sidebar
- navigation-sidebar-overlay
- navigation-sidebar-close-btn
- navigation-items
- nav-link-{path}
```

### Layout
```
- page-layout
- page-header
- logo-text
- main-content
- dialog-overlay
- dialog-close-btn
```

### Snippet Manager
```
- snippet-manager
- snippet-manager-loading
- snippet-search-input
- snippet-selection-mode-btn
- snippet-create-menu-trigger
- snippet-template-react-{id}
- snippet-template-python-{id}
- snippet-template-javascript-{id}
- snippet-card-{id}
- snippet-grid
```

### Snippet Actions
```
- snippet-card-view-btn
- snippet-card-copy-btn
- snippet-card-edit-btn
- snippet-card-actions-menu
- snippet-card-move-submenu
- move-to-namespace-{id}
- snippet-card-delete-btn
```

### Selection & Bulk Operations
```
- selection-controls
- select-all-btn
- selection-count
- bulk-move-menu-trigger
- bulk-move-menu
- bulk-move-to-namespace-{id}
```

### Forms
```
- snippet-title-input
- snippet-language-select
- snippet-language-options
- language-option-{lang}
- snippet-description-textarea
- snippet-dialog
- snippet-dialog-cancel-btn
- snippet-dialog-save-btn
```

### Snippet Viewer
```
- snippet-viewer-dialog
- snippet-viewer-toggle-preview-btn
- snippet-viewer-copy-btn
- snippet-viewer-edit-btn
```

### Namespaces
```
- namespace-selector-trigger
- namespace-selector-content
- namespace-option-{id}
```

### Toasts
```
- toast-container
```

---

## Best Practices Applied

### 1. **Icon Accessibility**
- All decorative icons have `aria-hidden="true"`
- Icon buttons always have `aria-label` or contextual button text

### 2. **Form Accessibility**
- Error messages linked via `aria-describedby`
- Invalid fields marked with `aria-invalid="true"`
- Labels properly associated with inputs via `htmlFor`

### 3. **Interactive Elements**
- Buttons have descriptive labels
- Toggle buttons use `aria-pressed` for state
- Dropdowns have clear trigger labels

### 4. **Screen Reader Support**
- All interactive regions have `aria-label` or `aria-labelledby`
- Decorative elements properly hidden
- Loading states announced with text
- Status messages using Sonner's built-in `aria-live="polite"`

### 5. **Testing Support**
- Semantic data-testid naming convention
- IDs include context (e.g., `snippet-card-{id}`)
- Dynamic IDs parameterized for consistency

---

## Testing Usage Examples

### Selecting Elements in Tests
```typescript
// Navigation
cy.get('[data-testid="navigation-toggle-btn"]').click()
cy.get('[data-testid="navigation-sidebar"]').should('be.visible')

// Snippet Management
cy.get('[data-testid="snippet-search-input"]').type('react')
cy.get('[data-testid="snippet-card-abc123"]').click()
cy.get('[data-testid="snippet-card-copy-btn"]').click()

// Forms
cy.get('[data-testid="snippet-title-input"]').type('New Snippet')
cy.get('[data-testid="snippet-dialog-save-btn"]').click()

// Selection
cy.get('[data-testid="select-all-btn"]').click()
cy.get('[data-testid="bulk-move-menu-trigger"]').click()
```

---

## Accessibility Testing Checklist

### Screen Reader Testing
- [ ] Test with NVDA (Windows) or JAWS
- [ ] Test with VoiceOver (macOS)
- [ ] Verify all buttons have descriptive labels
- [ ] Verify form errors are announced

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical (automatic with semantic HTML)
- [ ] Modal dialogs trap focus
- [ ] Escape key closes modals

### Visual Accessibility
- [ ] Sufficient color contrast (WCAG AA minimum)
- [ ] Focus indicators are visible
- [ ] Text is resizable
- [ ] No information conveyed by color alone

### Automated Testing
- [ ] Use `data-testid` for E2E tests
- [ ] Run axe-core or similar for automated checks
- [ ] Test responsive design with screen readers

---

## Future Enhancements

1. **Add keyboard shortcuts** - Document and implement vim-style shortcuts
2. **Enhanced tooltips** - Add aria-describedby tooltips for complex UI
3. **Loading states** - Add aria-busy for async operations
4. **Pagination** - Add aria-label for pagination controls
5. **Code syntax highlighting** - Ensure color contrast in code blocks
6. **Animations** - Add prefers-reduced-motion support
7. **Focus management** - Restore focus after dialog close
8. **Landmark navigation** - Skip to main content link

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Material Design 3 Accessibility](https://m3.material.io/foundations/accessible-design)
- [React Accessibility Guide](https://reactjs.org/docs/accessibility.html)

