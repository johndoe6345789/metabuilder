# Keyboard & Event Hooks - Quick Start

Fast reference for the 4 new hooks added to the `/hooks` folder.

## Import Statements

```typescript
import { useKeyboardShortcuts } from '@metabuilder/hooks'
import { useClickOutside } from '@metabuilder/hooks'
import { useHotkeys } from '@metabuilder/hooks'
import { useEventListener } from '@metabuilder/hooks'
```

---

## 1. useKeyboardShortcuts

Register keyboard shortcuts with automatic platform detection.

```typescript
const { registerShortcut, unregister, clearAll } = useKeyboardShortcuts()

// Register shortcut
useEffect(() => {
  const id = registerShortcut({
    key: 's',
    ctrl: true,           // Cmd on Mac, Ctrl on Windows
    shift: false,
    alt: false,
    onPress: () => save(),
    preventDefault: true,
    debounce: 0           // Optional: ms delay
  })

  return () => unregister(id)
}, [])
```

**Common patterns:**
```typescript
// Save
registerShortcut({ key: 's', ctrl: true, onPress: save, preventDefault: true })

// Open search
registerShortcut({ key: 'f', ctrl: true, onPress: openSearch, preventDefault: true })

// Close dialog
registerShortcut({ key: 'Escape', onPress: closeDialog })

// Navigate up/down
registerShortcut({ key: 'ArrowUp', onPress: () => selectPrev() })
registerShortcut({ key: 'ArrowDown', onPress: () => selectNext() })
```

---

## 2. useClickOutside

Detect clicks outside an element to close modals, dropdowns, etc.

```typescript
const { ref, isOpen, setIsOpen, toggle } = useClickOutside<HTMLDivElement>({
  onClickOutside: () => console.log('Closed'),
  excludeRefs: [triggerButtonRef],  // Don't close on these refs
  includeTouch: true,                // Include touch events
  delayMs: 0                         // Delay before closing
})

return (
  <>
    <button ref={triggerButtonRef} onClick={() => toggle()}>
      Open
    </button>
    {isOpen && (
      <div ref={ref}>
        {/* Clicks outside this div close it */}
      </div>
    )}
  </>
)
```

**Common patterns:**
```typescript
// Simple dropdown
const { ref, isOpen, setIsOpen } = useClickOutside()

// Modal that can't be closed by clicking trigger button
const { ref, isOpen, setIsOpen } = useClickOutside({
  excludeRefs: [triggerButtonRef]
})

// With callback
const { ref, isOpen, setIsOpen } = useClickOutside({
  onClickOutside: () => console.log('Closed from outside')
})
```

---

## 3. useHotkeys

Global hotkey registration with combo key support (ctrl+shift+k).

```typescript
const hotkeys = useHotkeys()

useEffect(() => {
  // Register hotkey
  const id = hotkeys.register('ctrl+s', () => {
    save()
  }, {
    preventDefault: true,    // Prevent browser default
    enabled: true,           // Enable/disable
    debounceMs: 0           // Optional: delay
  })

  // Cleanup
  return () => hotkeys.unregister(id)
}, [hotkeys])
```

**Common patterns:**
```typescript
// Save: Ctrl+S (Mac: Cmd+S)
hotkeys.register('ctrl+s', save, { preventDefault: true })

// Find: Ctrl+F
hotkeys.register('ctrl+f', openFind, { preventDefault: true })

// Replace: Ctrl+H
hotkeys.register('ctrl+h', openReplace, { preventDefault: true })

// Format: Ctrl+Shift+I
hotkeys.register('ctrl+shift+i', format, { preventDefault: true })

// Close all hotkeys at once
useEffect(() => {
  return () => hotkeys.unregisterAll()
}, [hotkeys])
```

**Combo key formats:**
- `'ctrl+s'` - Ctrl+S (or Cmd on Mac)
- `'shift+enter'` - Shift+Enter
- `'ctrl+shift+k'` - Ctrl+Shift+K
- `'alt+1'` - Alt+1
- `'cmd+opt+i'` - Cmd+Opt+I (Mac specific)

---

## 4. useEventListener

Generic event listener with automatic cleanup.

```typescript
const { add, remove, removeAll } = useEventListener()

useEffect(() => {
  // Add listener and get cleanup function
  const cleanup = add(
    window,
    'resize',
    (e: UIEvent) => {
      console.log('Resized')
    },
    {
      passive: true,    // Better performance for scroll/touch
      capture: false,   // Use capture phase
      once: false       // Auto-remove after first trigger
    }
  )

  // Return cleanup function
  return cleanup
}, [add])
```

**Common patterns:**
```typescript
// Window resize
add(window, 'resize', (e: UIEvent) => updateSize(), { passive: true })

// Window scroll
add(window, 'scroll', (e: Event) => updateScroll(), { passive: true })

// Element input
add(inputRef.current, 'input', (e: Event) => {
  const target = e.target as HTMLInputElement
  updateValue(target.value)
})

// Document click
add(document, 'click', (e: MouseEvent) => {
  console.log('Clicked at', e.clientX, e.clientY)
})

// Multiple listeners
useEffect(() => {
  add(window, 'resize', handleResize)
  add(window, 'scroll', handleScroll)
  add(document, 'click', handleClick)

  return removeAll  // Clean up all at once
}, [add, removeAll])
```

---

## Real-World Examples

### Example 1: Command Palette

```typescript
function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const { registerShortcut } = useKeyboardShortcuts()

  useEffect(() => {
    const id = registerShortcut({
      key: 'k',
      ctrl: true,
      onPress: () => setIsOpen(true),
      preventDefault: true
    })

    const closeId = registerShortcut({
      key: 'Escape',
      onPress: () => setIsOpen(false)
    })

    return () => {
      unregister(id)
      unregister(closeId)
    }
  }, [registerShortcut])

  return (
    <>
      <button>Cmd+K</button>
      {isOpen && <CommandPaletteModal />}
    </>
  )
}
```

### Example 2: Dropdown Menu

```typescript
function DropdownMenu() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdown = useClickOutside<HTMLDivElement>({
    excludeRefs: [triggerRef]
  })

  return (
    <>
      <button ref={triggerRef} onClick={() => dropdown.toggle()}>
        Menu
      </button>
      {dropdown.isOpen && (
        <div ref={dropdown.ref}>
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>
          <a href="/logout">Logout</a>
        </div>
      )}
    </>
  )
}
```

### Example 3: IDE Editor Shortcuts

```typescript
function CodeEditor() {
  const hotkeys = useHotkeys()

  useEffect(() => {
    hotkeys.register('ctrl+s', saveFile, { preventDefault: true })
    hotkeys.register('ctrl+f', openFind, { preventDefault: true })
    hotkeys.register('ctrl+h', openReplace, { preventDefault: true })
    hotkeys.register('ctrl+shift+i', formatCode, { preventDefault: true })
    hotkeys.register('Escape', closeDialogs)

    return () => hotkeys.unregisterAll()
  }, [hotkeys])

  return <Editor />
}
```

### Example 4: Responsive Layout

```typescript
function ResponsiveLayout() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const { add } = useEventListener()

  useEffect(() => {
    return add(window, 'resize', () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }, { passive: true })
  }, [add])

  return (
    <div>
      {size.width < 768 && <MobileLayout />}
      {size.width >= 768 && <DesktopLayout />}
    </div>
  )
}
```

---

## Type Safety

All hooks have full TypeScript support:

```typescript
// useKeyboardShortcuts
interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  onPress: () => void
  preventDefault?: boolean
  debounce?: number
}

// useClickOutside<T extends HTMLElement>
interface UseClickOutsideOptions {
  onClickOutside?: () => void
  excludeRefs?: React.RefObject<HTMLElement>[]
  includeTouch?: boolean
  delayMs?: number
}

// useHotkeys
interface HotkeysOptions {
  preventDefault?: boolean
  enabled?: boolean
  debounceMs?: number
}

// useEventListener
type EventHandler<T extends Event = Event> = (event: T) => void
interface EventListenerOptions extends AddEventListenerOptions {
  passive?: boolean
  capture?: boolean
  once?: boolean
}
```

---

## Common Gotchas

1. **Always cleanup**: Return cleanup function from useEffect
   ```typescript
   // ✓ Good
   useEffect(() => {
     const id = registerShortcut(...)
     return () => unregister(id)
   }, [])
   ```

2. **Exclude refs matter**: Remember to exclude trigger button
   ```typescript
   // ✓ Good - won't close when clicking button
   useClickOutside({ excludeRefs: [triggerRef] })
   ```

3. **Passive listeners can't preventDefault**:
   ```typescript
   // ✗ Won't work - passive listeners can't prevent default
   add(window, 'scroll', (e) => e.preventDefault(), { passive: true })
   ```

4. **Platform detection is automatic**:
   ```typescript
   // ✓ Good - automatically uses Cmd on Mac, Ctrl on Windows
   registerShortcut({ key: 's', ctrl: true, onPress: save })
   ```

---

## Full Documentation

See `KEYBOARD_EVENT_HOOKS.md` for comprehensive documentation with more examples, best practices, performance tips, and troubleshooting guide.
