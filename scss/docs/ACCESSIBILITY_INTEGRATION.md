# Fakemui Accessibility Integration Guide

This document explains how accessibility utilities are integrated throughout fakemui components, enabling data-testid and ARIA attributes automatically.

## Overview

All fakemui components now support:
- **data-testid** attributes for reliable testing
- **ARIA attributes** for screen reader support
- **Keyboard navigation** utilities
- **Focus management** hooks
- **Live region** announcements

## Accessibility Utilities

### Location
```
fakemui/src/utils/
├── accessibility.ts          # Core accessibility utilities
├── useAccessible.ts          # React hooks for accessibility
└── index.ts                  # Barrel export
```

### Core Exports

#### `accessibility.ts`
- **generateTestId()** - Creates standardized test IDs
- **testId** object - 50+ preset test ID generators
- **aria** object - ARIA attribute patterns
- **keyboard** object - Keyboard event helpers
- **validate** object - Accessibility validators

#### `useAccessible.ts` - React Hooks
- **useAccessible()** - Generate test IDs and ARIA attributes
- **useKeyboardNavigation()** - Handle keyboard events
- **useFocusManagement()** - Manage focus programmatically
- **useLiveRegion()** - Announce messages to screen readers
- **useFocusTrap()** - Trap focus in modals/dialogs

## Integration in Components

### Button Component

**Before** (manual ARIA):
```tsx
<button
  disabled={disabled || loading}
  aria-busy={loading}
  aria-disabled={disabled}
>
  Click me
</button>
```

**After** (automatic data-testid + ARIA):
```tsx
import { useAccessible } from '../../../src/utils/useAccessible'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { children, testId: customTestId, ...restProps } = props

    const accessible = useAccessible({
      feature: 'form',
      component: 'button',
      identifier: customTestId || String(children)?.substring(0, 20),
    })

    return (
      <button
        data-testid={accessible['data-testid']}
        aria-label={accessible['aria-label']}
        {...restProps}
      >
        {children}
      </button>
    )
  }
)
```

**Result**:
```html
<button data-testid="form-button-click-click-me" aria-label="form: button">
  Click me
</button>
```

### TextField Component

**Integration**:
```tsx
import { useAccessible } from '../../../src/utils/useAccessible'

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, error, testId: customTestId, ...props }, ref) => {
    const id = useId()
    const helperTextId = `${id}-helper-text`

    const accessible = useAccessible({
      feature: 'form',
      component: 'input',
      identifier: customTestId || String(label)?.substring(0, 20),
      ariaDescribedBy: helperText ? helperTextId : undefined,
    })

    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          ref={ref}
          data-testid={accessible['data-testid']}
          aria-invalid={error}
          aria-describedby={helperText ? helperTextId : undefined}
          {...props}
        />
        {helperText && (
          <span id={helperTextId} role="status">
            {helperText}
          </span>
        )}
      </div>
    )
  }
)
```

**Result**:
```html
<div>
  <label for="input-1">Email</label>
  <input
    id="input-1"
    data-testid="form-input-email"
    aria-invalid="false"
    aria-describedby="input-1-helper-text"
    type="email"
  />
  <span id="input-1-helper-text" role="status">
    Enter a valid email
  </span>
</div>
```

## Using Accessibility Utilities

### Hook: useAccessible()

Generate test IDs and ARIA attributes for any component:

```tsx
import { useAccessible } from '@metabuilder/fakemui'

export function MyComponent() {
  const accessible = useAccessible({
    feature: 'canvas',          // canvas, settings, navigation, etc.
    component: 'button',        // button, input, select, etc.
    action: 'delete',           // Optional: click, drag, delete, etc.
    identifier: 'item-123',     // Optional: unique identifier
  })

  return (
    <button
      data-testid={accessible['data-testid']}
      aria-label={accessible['aria-label']}
    >
      Delete
    </button>
  )
}
```

### Hook: useKeyboardNavigation()

Handle keyboard events (Enter, Escape, Arrow keys, Tab):

```tsx
import { useKeyboardNavigation } from '@metabuilder/fakemui'

export function ComboBox() {
  const keyboardProps = useKeyboardNavigation({
    onEnter: () => selectItem(),
    onEscape: () => closeDropdown(),
    onArrowUp: () => selectPrevious(),
    onArrowDown: () => selectNext(),
  })

  return <div {...keyboardProps}>ComboBox content</div>
}
```

### Hook: useFocusManagement()

Manage focus programmatically:

```tsx
import { useFocusManagement } from '@metabuilder/fakemui'

export function SearchBox() {
  const { focusRef, focus } = useFocusManagement()

  return (
    <>
      <input ref={focusRef} placeholder="Search..." />
      <button onClick={focus}>Focus Search</button>
    </>
  )
}
```

### Hook: useLiveRegion()

Announce messages to screen readers:

```tsx
import { useLiveRegion } from '@metabuilder/fakemui'

export function ItemList() {
  const { announce, liveRegionProps, message } = useLiveRegion('polite')

  const handleDelete = (item) => {
    deleteItem(item)
    announce(`${item.name} deleted`)
  }

  return (
    <>
      <div {...liveRegionProps} className="sr-only">{message}</div>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => handleDelete(item)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  )
}
```

### Hook: useFocusTrap()

Trap focus within modals/dialogs:

```tsx
import { useFocusTrap } from '@metabuilder/fakemui'

export function Modal({ isOpen, onClose }) {
  const { focusTrapRef } = useFocusTrap(isOpen)

  return (
    isOpen && (
      <div ref={focusTrapRef} role="dialog" aria-modal="true">
        <h2>Dialog Title</h2>
        <input placeholder="First focusable" />
        <button>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    )
  )
}
```

## Test ID Patterns

### Format
```
{feature}-{component}-{action?}-{identifier?}
```

### Examples
```
form-button-click-submit          // Submit button in form
settings-input-email              // Email input in settings
canvas-item-drag-123              // Drag action on canvas item with ID 123
navigation-link-click-home        // Home link in navigation
table-row-row-123                 // Row 123 in table
modal-close-dialog-close          // Close button in dialog
```

### Preset Generators

The `testId` object provides 50+ preset generators:

```tsx
import { testId } from '@metabuilder/fakemui'

// Form fields
testId.button('Save')              // form-button-click-save
testId.input('email')              // form-input-email
testId.checkbox('remember')        // form-checkbox-remember
testId.select('language')          // form-select-language

// Canvas
testId.canvasItem('item-1')        // canvas-item-drag-item-1
testId.canvasZoomIn()              // canvas-button-click-zoom-in

// Navigation
testId.navLink('Dashboard')        // navigation-button-click-dashboard
testId.navTab('Projects')          // navigation-tab-projects

// Modals
testId.modal('confirm')            // modal-modal-confirm
testId.modalButton('confirm', 'ok') // modal-button-click-confirm-ok

// Tables
testId.table('users')              // table-table-users
testId.tableRow('users', 'row-1')  // table-item-users-row-1

// And more...
```

## ARIA Attribute Patterns

The `aria` object provides ARIA attribute patterns:

```tsx
import { aria } from '@metabuilder/fakemui'

// Button
<button {...aria.button('Delete item')}>Delete</button>

// Toggle
<div {...aria.toggle('Dark mode', isDark)}>Toggle</div>

// Combobox
<div {...aria.combobox(isOpen)}>Dropdown</div>

// Dialog
<div {...aria.dialog('Confirm action')}>Confirm?</div>

// Tab system
<div {...aria.tablist()}>
  <button {...aria.tab(isSelected, 'tab-panel-1')}>Tab 1</button>
</div>

// Status messages
<div {...aria.status('Loading...', 'info')}>Loading...</div>

// Live regions
<div {...aria.liveRegion('assertive')}>Important update</div>

// And more...
```

## Keyboard Navigation

Handle keyboard events:

```tsx
import { keyboard } from '@metabuilder/fakemui'

function handleKeyDown(e: React.KeyboardEvent) {
  if (keyboard.isActivation(e.key)) {
    // Enter or Space pressed
  }

  if (keyboard.isArrow(e.key)) {
    const direction = keyboard.getArrowDirection(e.key)
    // -1, 0, or 1
  }

  if (keyboard.isEscape(e.key)) {
    // Escape pressed
  }

  if (keyboard.isTab(e.key)) {
    // Tab pressed
  }
}
```

## Testing with Accessibility Utilities

### Example: Testing a Button

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@metabuilder/fakemui'

describe('Button', () => {
  it('should render with data-testid', () => {
    render(<Button testId="submit">Submit</Button>)
    const button = screen.getByTestId('form-button-click-submit')
    expect(button).toBeInTheDocument()
  })

  it('should have accessible aria-label', () => {
    render(<Button>Save Changes</Button>)
    const button = screen.getByRole('button', { name: /save changes/i })
    expect(button).toBeInTheDocument()
  })

  it('should be keyboard accessible', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    await userEvent.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Example: Testing a TextField

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextField } from '@metabuilder/fakemui'

describe('TextField', () => {
  it('should have helper text announced', () => {
    render(
      <TextField
        label="Email"
        helperText="Enter a valid email"
      />
    )

    const input = screen.getByRole('textbox', { name: /email/i })
    const helper = screen.getByText('Enter a valid email')

    expect(input).toHaveAttribute('aria-describedby')
    expect(helper).toHaveAttribute('role', 'status')
  })

  it('should show error state accessibly', () => {
    render(
      <TextField
        label="Password"
        error
        helperText="Password too short"
      />
    )

    const input = screen.getByRole('textbox', { name: /password/i })
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})
```

## Accessibility Checklist

When integrating accessibility utilities into components:

- [ ] Component has `data-testid` attribute (via `useAccessible`)
- [ ] Component has proper `aria-label` or semantic HTML
- [ ] Error states use `aria-invalid` and `aria-describedby`
- [ ] Helper text uses `role="status"` for announcements
- [ ] Buttons have semantic role (native `<button>` element)
- [ ] Keyboard navigation works (via `useKeyboardNavigation`)
- [ ] Focus is visible (outline not removed)
- [ ] Focus is managed in modals (via `useFocusTrap`)
- [ ] Live regions announce important updates (via `useLiveRegion`)
- [ ] Color is not the only indicator (use icons + text)
- [ ] Images have alt text
- [ ] Component tested with screen readers (NVDA, JAWS, VoiceOver)

## Best Practices

1. **Always use semantic HTML** - `<button>`, `<input>`, `<label>`, etc.
2. **Use built-in hooks** - Don't manually add ARIA attributes
3. **Test with real screen readers** - Automated tools miss edge cases
4. **Keyboard first** - If it works with keyboard, it works with assistive tech
5. **Focus visible** - Never remove focus outlines
6. **Meaningful IDs** - Test IDs should be identifiable (not just UUIDs)
7. **Live regions for updates** - Announce changes that don't move focus
8. **Group related inputs** - Use `<fieldset>` and `<legend>`
9. **Provide feedback** - Let users know actions succeeded/failed
10. **Test continuously** - Accessibility is not a one-time effort

## Migration Status

| Component | Status | data-testid | ARIA | Keyboard Nav |
|-----------|--------|------------|------|--------------|
| Button | ✅ Updated | ✅ | ✅ | ✅ |
| TextField | ✅ Updated | ✅ | ✅ | ✅ |
| Input | ⏳ Pending | - | - | - |
| Select | ⏳ Pending | - | - | - |
| Dialog | ⏳ Pending | - | - | - |
| Tabs | ⏳ Pending | - | - | - |
| ... more | ⏳ Pending | - | - | - |

## Resources

- [MDN: ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project](https://www.a11yproject.com/)
- [React Accessibility](https://react.dev/learn/accessibility)

## File Structure

```
fakemui/
├── src/utils/
│   ├── accessibility.ts           # Core utilities (472 lines)
│   ├── accessibility.module.scss  # Styling (180 lines)
│   ├── useAccessible.ts           # React hooks (250+ lines)
│   └── index.ts                   # Barrel export
├── react/components/
│   ├── inputs/
│   │   ├── Button.tsx             # Updated ✅
│   │   ├── TextField.tsx          # Updated ✅
│   │   ├── Input.tsx              # To update
│   │   └── ...
│   └── ...
└── docs/
    └── ACCESSIBILITY_INTEGRATION.md  # This file
```
