# Keyboard & Event Hooks

Comprehensive keyboard shortcut and event listener hooks for MetaBuilder applications.

## Quick Reference

| Hook | Purpose | Returns |
|------|---------|---------|
| **useKeyboardShortcuts** | Unified keyboard shortcut handling with meta keys | `{ registerShortcut, unregister, clearAll }` |
| **useClickOutside** | Detect clicks outside element | `{ ref, isOpen, setIsOpen, toggle }` |
| **useHotkeys** | Global hotkey registration with combo support | `{ register, unregister, unregisterAll }` |
| **useEventListener** | Generic event listener with cleanup | `{ add, remove, removeAll }` |

---

## useKeyboardShortcuts

Unified keyboard shortcut handling with automatic platform detection (macOS vs Windows/Linux).

### Features
- Register shortcuts with meta keys (cmd/ctrl, shift, alt)
- Platform detection (Mac vs Windows)
- Prevent default browser shortcuts
- Debounce support
- Clean unregistration

### Basic Usage

```typescript
import { useKeyboardShortcuts } from '@metabuilder/hooks'

function SaveDialog() {
  const { registerShortcut, unregister } = useKeyboardShortcuts()

  useEffect(() => {
    // Register Ctrl+S (or Cmd+S on Mac)
    const id = registerShortcut({
      key: 's',
      ctrl: true,
      onPress: () => handleSave(),
      preventDefault: true
    })

    return () => unregister(id)
  }, [])

  return <div>Save with Ctrl+S</div>
}
```

### Meta Key Handling

```typescript
const { registerShortcut } = useKeyboardShortcuts()

// Automatic cross-platform:
// - On Mac: uses Cmd key
// - On Windows: uses Ctrl key
registerShortcut({
  key: 's',
  ctrl: true,      // Triggers Cmd on Mac, Ctrl on Windows
  onPress: save
})

// macOS-specific
registerShortcut({
  key: 's',
  cmd: true,       // Only Cmd on Mac
  onPress: save
})
```

### Complex Shortcuts

```typescript
const { registerShortcut } = useKeyboardShortcuts()

// Ctrl+Shift+Enter
registerShortcut({
  key: 'Enter',
  ctrl: true,
  shift: true,
  onPress: submitForm
})

// Ctrl+Alt+K (without preventDefault)
registerShortcut({
  key: 'k',
  ctrl: true,
  alt: true,
  onPress: openCommandPalette
})

// Escape key
registerShortcut({
  key: 'Escape',
  onPress: closeDialog
})
```

### With Debounce

```typescript
const { registerShortcut } = useKeyboardShortcuts()

// Prevent rapid successive triggers
registerShortcut({
  key: 's',
  ctrl: true,
  onPress: autoSave,
  debounce: 500  // Wait 500ms before processing
})
```

### API

```typescript
interface KeyboardShortcut {
  key: string                    // Key name or character
  ctrl?: boolean                 // Ctrl key (Windows/Linux)
  cmd?: boolean                  // Cmd key (macOS)
  shift?: boolean                // Shift key
  alt?: boolean                  // Alt key
  onPress: () => void            // Callback
  preventDefault?: boolean       // Prevent default action
  debounce?: number              // Debounce in ms
}

// Return types
registerShortcut(shortcut): string   // Returns ID
unregister(id: string): void         // Remove by ID
clearAll(): void                     // Remove all
```

---

## useClickOutside

Detect clicks outside a referenced element for modals, dropdowns, menus.

### Features
- Element reference tracking
- Open state management
- Support for excluded refs
- Touch event support
- Delay option

### Basic Usage

```typescript
import { useClickOutside } from '@metabuilder/hooks'

function Dropdown() {
  const { ref, isOpen, setIsOpen } = useClickOutside()

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Menu</button>
      {isOpen && (
        <div ref={ref}>
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      )}
    </div>
  )
}
```

### With Callback

```typescript
const { ref, isOpen, setIsOpen } = useClickOutside({
  onClickOutside: () => {
    console.log('Closed by outside click')
  }
})
```

### Exclude Refs

```typescript
const triggerRef = useRef<HTMLButtonElement>(null)
const dropdownRef = useClickOutside({
  excludeRefs: [triggerRef]  // Don't close when clicking trigger
})

return (
  <div>
    <button ref={triggerRef} onClick={() => setOpen(true)}>
      Open
    </button>
    {isOpen && (
      <div ref={dropdownRef.ref}>Menu</div>
    )}
  </div>
)
```

### With Delay

```typescript
const { ref, isOpen, setIsOpen } = useClickOutside({
  delayMs: 200  // Wait 200ms before closing
})
```

### API

```typescript
interface UseClickOutsideOptions {
  onClickOutside?: () => void              // Callback on outside click
  excludeRefs?: React.RefObject<HTMLElement>[]  // Refs to exclude
  includeTouch?: boolean                   // Include touch events (default: true)
  delayMs?: number                         // Delay before closing (ms)
}

// Returns
{
  ref: React.RefObject<T>                  // Attach to element
  isOpen: boolean                          // Is currently open
  setIsOpen: (open: boolean) => void       // Set state
  toggle: () => void                       // Toggle state
}
```

---

## useHotkeys

Global hotkey registration with combo key support (ctrl+shift+k style).

### Features
- Combo key parsing (ctrl+shift+enter)
- Platform-aware (cmd on Mac, ctrl on Windows)
- Handler registration
- Debounce support
- Enable/disable per hotkey

### Basic Usage

```typescript
import { useHotkeys } from '@metabuilder/hooks'

function SearchBox() {
  const hotkeys = useHotkeys()

  useEffect(() => {
    // Command palette: Ctrl+K
    hotkeys.register('ctrl+k', () => {
      openCommandPalette()
    })

    // Escape to close
    hotkeys.register('Escape', () => {
      closeCommandPalette()
    })
  }, [hotkeys])

  return <SearchBox />
}
```

### Combo Key Formats

```typescript
const hotkeys = useHotkeys()

// Supported format: modifiers+key
hotkeys.register('ctrl+s', save)              // Ctrl+S
hotkeys.register('ctrl+shift+k', search)      // Ctrl+Shift+K
hotkeys.register('cmd+opt+i', inspector)      // Cmd+Opt+I (Mac: opt=alt)
hotkeys.register('shift+enter', submitForm)   // Shift+Enter
hotkeys.register('alt+1', switchTab1)         // Alt+1

// Single key
hotkeys.register('Escape', closeMenu)
```

### With Options

```typescript
const hotkeys = useHotkeys()

const id = hotkeys.register('ctrl+shift+k', openPalette, {
  preventDefault: true,  // Prevent browser defaults
  enabled: true,         // Enable/disable this hotkey
  debounceMs: 100       // Debounce rapid presses
})

// Later unregister
hotkeys.unregister(id)
```

### Platform-Specific

```typescript
const hotkeys = useHotkeys()

// Automatically uses Cmd on Mac, Ctrl on Windows
hotkeys.register('ctrl+s', save)

// You can also manually handle it
const saveKey = navigator.platform.includes('Mac') ? 'cmd+s' : 'ctrl+s'
hotkeys.register(saveKey, save)
```

### API

```typescript
interface HotkeysOptions {
  preventDefault?: boolean       // Prevent default action
  enabled?: boolean              // Enable/disable (default: true)
  debounceMs?: number            // Debounce delay
}

// Returns
{
  register(combo, handler, options?): string   // Returns ID
  unregister(id: string): void                 // Remove by ID
  unregisterAll(): void                        // Remove all
}
```

---

## useEventListener

Generic event listener with proper cleanup for any event type.

### Features
- Generic typing for any event
- Passive listener support (scroll/touch performance)
- Works with window, document, element
- Automatic cleanup
- Capture phase support
- Type-safe handlers

### Basic Usage

```typescript
import { useEventListener } from '@metabuilder/hooks'

function ResizeHandler() {
  const { add } = useEventListener()

  useEffect(() => {
    const remove = add(window, 'resize', (e: UIEvent) => {
      console.log('Window resized')
    })

    return remove
  }, [add])

  return <div>Listen for resizes</div>
}
```

### Element Events

```typescript
const { add } = useEventListener()
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  if (!inputRef.current) return

  const remove = add(
    inputRef.current,
    'input',
    (e: Event) => {
      const target = e.target as HTMLInputElement
      console.log('Value:', target.value)
    }
  )

  return remove
}, [add])
```

### Passive Listeners

```typescript
const { add } = useEventListener()

// Passive listeners for better scroll performance
add(window, 'scroll', (e: Event) => {
  console.log('Scrolling')
}, {
  passive: true  // Won't call preventDefault
})

add(window, 'touchmove', (e: TouchEvent) => {
  console.log('Touch moving')
}, {
  passive: true  // Better mobile performance
})
```

### Capture Phase

```typescript
const { add } = useEventListener()

// Capture phase (runs before bubble phase)
add(document, 'click', (e: MouseEvent) => {
  console.log('Clicked in capture phase')
}, {
  capture: true
})
```

### Document Events

```typescript
const { add } = useEventListener()

add(document, 'click', (e: MouseEvent) => {
  console.log('Clicked at', e.clientX, e.clientY)
})

add(document, 'keydown', (e: KeyboardEvent) => {
  console.log('Key:', e.key)
})
```

### Multiple Listeners

```typescript
const { add, removeAll } = useEventListener()

useEffect(() => {
  // Add multiple listeners
  add(window, 'resize', handleResize)
  add(window, 'scroll', handleScroll)
  add(document, 'click', handleClick)

  // Clean up all at once
  return removeAll
}, [add, removeAll])
```

### API

```typescript
interface EventListenerOptions extends AddEventListenerOptions {
  passive?: boolean              // Better performance (default: false)
  capture?: boolean              // Use capture phase (default: false)
  once?: boolean                 // Auto-remove after first trigger
}

// Returns
{
  add(target, event, handler, options?): () => void      // Returns cleanup fn
  remove(target, event, handler, options?): void         // Manual removal
  removeAll(): void                                       // Remove all listeners
}

// Types
type EventHandler<T extends Event = Event> = (event: T) => void
```

---

## Best Practices

### 1. Always Clean Up

```typescript
// ✅ Good - cleanup on unmount
useEffect(() => {
  const id = registerShortcut(...)
  return () => unregister(id)
}, [])

// ❌ Bad - leaves listeners
const { registerShortcut } = useKeyboardShortcuts()
registerShortcut(...)  // Never cleaned up
```

### 2. Use TypeScript

```typescript
// ✅ Good - typed events
const { add } = useEventListener()
add(window, 'resize', (e: UIEvent) => {
  // e is properly typed
}, { passive: true })

// ❌ Avoid - any types
add(window, 'resize', (e: any) => {})
```

### 3. Respect Passive Listeners

```typescript
// ✅ Good - passive for scroll
add(window, 'scroll', handleScroll, { passive: true })

// ⚠️ Can't preventDefault with passive
add(window, 'touchstart', (e: TouchEvent) => {
  // e.preventDefault() won't work here
}, { passive: true })
```

### 4. Platform Detection

```typescript
// ✅ Good - useKeyboardShortcuts handles it
const { registerShortcut } = useKeyboardShortcuts()
registerShortcut({
  key: 's',
  ctrl: true,  // Automatic: Cmd on Mac, Ctrl elsewhere
  onPress: save
})

// ✅ Also good - useHotkeys combo parsing
const hotkeys = useHotkeys()
hotkeys.register('ctrl+s', save)  // Auto cross-platform
```

### 5. Avoid Memory Leaks

```typescript
// ✅ Good
useEffect(() => {
  const { ref, isOpen, setIsOpen } = useClickOutside()
  return () => {
    // useClickOutside cleans up automatically
  }
}, [])

// ✅ Also good
const { add, removeAll } = useEventListener()
useEffect(() => {
  add(window, 'resize', handleResize)
  return removeAll  // Clean everything
}, [])
```

---

## Performance Tips

1. **Use passive listeners for scroll/touch** - prevents jank
2. **Debounce rapid keyboard shortcuts** - avoid processing storms
3. **Use capture phase rarely** - default bubble is usually better
4. **Remove unused hotkeys** - don't let them pile up
5. **Group related listeners** - use one useEventListener for related events

---

## Migration Guide

### From Native Event Listeners

```typescript
// Before
useEffect(() => {
  const handler = () => console.log('Resized')
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])

// After
const { add } = useEventListener()
useEffect(() => {
  return add(window, 'resize', () => console.log('Resized'))
}, [add])
```

### From Custom Shortcut Handlers

```typescript
// Before
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      save()
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])

// After
const { registerShortcut } = useKeyboardShortcuts()
useEffect(() => {
  const id = registerShortcut({
    key: 's',
    ctrl: true,
    onPress: save,
    preventDefault: true
  })
  return () => unregister(id)
}, [])
```

---

## Troubleshooting

### Shortcuts not triggering
- Check key name matches `event.key` exactly
- Verify platform (Mac uses cmd, not ctrl)
- Ensure preventDefault isn't conflicting

### Click outside not closing
- Add element ref to the target element
- Verify trigger button isn't in excludeRefs unintentionally
- Check for nested refs with event propagation

### Memory leaks
- Always return cleanup function from useEffect
- Call removeAll() or unregister() for cleanup
- Don't create multiple hook instances unnecessarily

### Event handler not firing
- Verify event name is correct (e.g., 'input' vs 'change')
- Check passive listeners can't preventDefault
- Ensure target element exists in DOM
