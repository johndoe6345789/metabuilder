/**
 * Integration Examples
 * Complete examples showing all 4 keyboard/event hooks working together
 *
 * These examples demonstrate real-world usage patterns and best practices.
 */

import { useEffect, useRef, useState } from 'react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { useClickOutside } from './useClickOutside'
import { useHotkeys } from './useHotkeys'
import { useEventListener } from './useEventListener'

/**
 * Example 1: Command Palette with Keyboard Shortcuts
 *
 * Features:
 * - Open with Ctrl+K
 * - Navigate with arrow keys
 * - Select with Enter
 * - Close with Escape
 */
export function CommandPaletteExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { registerShortcut, unregister } = useKeyboardShortcuts()

  useEffect(() => {
    // Open palette
    const openId = registerShortcut({
      key: 'k',
      ctrl: true,
      onPress: () => setIsOpen(true),
      preventDefault: true,
    })

    // Navigation
    const upId = registerShortcut({
      key: 'ArrowUp',
      onPress: () => setSelectedIndex((prev) => Math.max(0, prev - 1)),
    })

    const downId = registerShortcut({
      key: 'ArrowDown',
      onPress: () => setSelectedIndex((prev) => prev + 1),
    })

    // Selection
    const selectId = registerShortcut({
      key: 'Enter',
      onPress: () => handleSelect(),
    })

    // Close
    const closeId = registerShortcut({
      key: 'Escape',
      onPress: () => setIsOpen(false),
    })

    return () => {
      unregister(openId)
      unregister(upId)
      unregister(downId)
      unregister(selectId)
      unregister(closeId)
    }
  }, [registerShortcut])

  const handleSelect = () => {
    console.log('Selected index:', selectedIndex)
    setIsOpen(false)
  }

  return (
    <div>
      <h2>Command Palette (Ctrl+K)</h2>
      {isOpen && (
        <div>
          <div>Item {selectedIndex}</div>
        </div>
      )}
    </div>
  )
}

/**
 * Example 2: Advanced Modal with Click Outside Detection
 *
 * Features:
 * - Click outside closes modal
 * - Trigger button excluded from close
 * - Backdrop animation delay
 * - Touch and mouse support
 */
export function AdvancedModalExample() {
  const triggerButtonRef = useRef<HTMLButtonElement>(null)

  const modal = useClickOutside<HTMLDivElement>({
    excludeRefs: [triggerButtonRef],
    onClickOutside: () => {
      console.log('Modal closed by outside click')
    },
    includeTouch: true,
    delayMs: 0, // Immediate close
  })

  return (
    <div>
      <button
        ref={triggerButtonRef}
        onClick={() => modal.toggle()}
      >
        Open Modal
      </button>

      {modal.isOpen && (
        <div className="modal-backdrop">
          <div ref={modal.ref} className="modal">
            <h2>Modal Content</h2>
            <button onClick={() => modal.setIsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Example 3: IDE-like Editor with Multiple Hotkeys
 *
 * Features:
 * - Save: Ctrl+S / Cmd+S
 * - Find: Ctrl+F / Cmd+F
 * - Replace: Ctrl+H / Cmd+H
 * - Close: Escape
 * - Format: Ctrl+Shift+I / Cmd+Shift+I
 */
export function IDEEditorExample() {
  const hotkeys = useHotkeys()

  useEffect(() => {
    // Save file
    hotkeys.register('ctrl+s', () => {
      console.log('Saving file...')
    }, {
      preventDefault: true,
    })

    // Find dialog
    hotkeys.register('ctrl+f', () => {
      console.log('Opening find...')
    }, {
      preventDefault: true,
    })

    // Find & Replace
    hotkeys.register('ctrl+h', () => {
      console.log('Opening find & replace...')
    }, {
      preventDefault: true,
    })

    // Format code
    hotkeys.register('ctrl+shift+i', () => {
      console.log('Formatting code...')
    }, {
      preventDefault: true,
    })

    // Close
    hotkeys.register('Escape', () => {
      console.log('Closing dialogs...')
    })

    // Cleanup all hotkeys on unmount
    return () => hotkeys.unregisterAll()
  }, [hotkeys])

  return (
    <div>
      <h2>IDE Editor</h2>
      <p>Try: Ctrl+S, Ctrl+F, Ctrl+H, Ctrl+Shift+I</p>
    </div>
  )
}

/**
 * Example 4: Window Resize Listener with Performance
 *
 * Features:
 * - Track window size
 * - Passive listener for performance
 * - Debounced updates
 * - Responsive breakpoints
 */
export function ResponsiveLayoutExample() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const { add } = useEventListener()

  useEffect(() => {
    // Add passive resize listener
    return add(window, 'resize', (e: UIEvent) => {
      // Debounce the update
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        const target = e.target as Window
        setWindowSize({
          width: target.innerWidth,
          height: target.innerHeight,
        })
      }, 100)
    }, {
      passive: true,
    })
  }, [add])

  const isMobile = windowSize.width < 640
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024
  const isDesktop = windowSize.width >= 1024

  return (
    <div>
      <h2>Responsive Layout</h2>
      <p>Size: {windowSize.width}x{windowSize.height}</p>
      {isMobile && <p>Mobile view</p>}
      {isTablet && <p>Tablet view</p>}
      {isDesktop && <p>Desktop view</p>}
    </div>
  )
}

/**
 * Example 5: Complete Dashboard with All Hooks
 *
 * Features:
 * - Command palette (Ctrl+K)
 * - Dropdown menus (click outside)
 * - Global hotkeys (save, search)
 * - Event listeners (resize, scroll)
 */
export function CompleteDashboardExample() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  const userMenuRef = useClickOutside<HTMLDivElement>({
    onClickOutside: () => setUserMenuOpen(false),
  })

  const { registerShortcut, unregister } = useKeyboardShortcuts()
  const hotkeys = useHotkeys()
  const { add } = useEventListener()

  useEffect(() => {
    // Command palette shortcut
    const cmdId = registerShortcut({
      key: 'k',
      ctrl: true,
      onPress: () => setCommandPaletteOpen(true),
      preventDefault: true,
    })

    // Close command palette with Escape
    const escapeId = registerShortcut({
      key: 'Escape',
      onPress: () => setCommandPaletteOpen(false),
    })

    return () => {
      unregister(cmdId)
      unregister(escapeId)
    }
  }, [registerShortcut, unregister])

  useEffect(() => {
    // Global hotkeys for dashboard
    hotkeys.register('ctrl+s', () => {
      console.log('Saving dashboard...')
    }, { preventDefault: true })

    hotkeys.register('ctrl+f', () => {
      console.log('Opening search...')
    }, { preventDefault: true })

    return () => hotkeys.unregisterAll()
  }, [hotkeys])

  useEffect(() => {
    // Track scroll position
    return add(window, 'scroll', (e: Event) => {
      setScrollPosition(window.scrollY)
    }, {
      passive: true,
    })
  }, [add])

  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <button onClick={() => setCommandPaletteOpen(true)}>
          Command Palette (Ctrl+K)
        </button>
        <div>
          <button onClick={() => userMenuRef.toggle()}>
            User Menu
          </button>
          {userMenuRef.isOpen && (
            <div ref={userMenuRef.ref}>
              <div>Profile</div>
              <div>Settings</div>
              <div>Logout</div>
            </div>
          )}
        </div>
      </header>

      <main>
        <p>Scroll position: {scrollPosition}</p>
        <p>Try Ctrl+K for command palette, Ctrl+S to save</p>
      </main>

      {commandPaletteOpen && (
        <div className="command-palette">
          <input placeholder="Type a command..." />
        </div>
      )}
    </div>
  )
}

/**
 * Example 6: Custom Hook Composition
 *
 * Shows how to create a higher-level hook that combines
 * all 4 keyboard/event hooks for common patterns.
 */
export function useDialogWithShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  const { ref, isOpen: clickOutsideOpen, setIsOpen: setClickOutsideOpen } =
    useClickOutside<HTMLDivElement>({
      onClickOutside: () => setIsOpen(false),
    })

  const { registerShortcut, unregister } = useKeyboardShortcuts()

  useEffect(() => {
    if (!isOpen) return

    // Close with Escape
    const id = registerShortcut({
      key: 'Escape',
      onPress: () => setIsOpen(false),
    })

    return () => unregister(id)
  }, [isOpen, registerShortcut, unregister])

  return {
    ref,
    isOpen,
    setIsOpen,
  }
}

// Usage of custom hook
export function DialogWithShortcutsExample() {
  const dialog = useDialogWithShortcuts()

  return (
    <div>
      <button onClick={() => dialog.setIsOpen(true)}>
        Open Dialog
      </button>

      {dialog.isOpen && (
        <div ref={dialog.ref} className="dialog">
          <h2>Dialog (Click outside or press Escape to close)</h2>
        </div>
      )}
    </div>
  )
}

/**
 * Example 7: Form with Save Hotkey
 *
 * Features:
 * - Auto-save on Ctrl+S
 * - Debounced keyboard input
 * - Click outside closes suggestions
 */
export function FormWithHotkeysExample() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestionsRef = useClickOutside<HTMLDivElement>({
    onClickOutside: () => setShowSuggestions(false),
  })

  const { registerShortcut, unregister } = useKeyboardShortcuts()
  const { add } = useEventListener()

  useEffect(() => {
    // Save with Ctrl+S
    const saveId = registerShortcut({
      key: 's',
      ctrl: true,
      onPress: () => {
        console.log('Saving form:', formData)
      },
      preventDefault: true,
    })

    return () => unregister(saveId)
  }, [formData, registerShortcut, unregister])

  useEffect(() => {
    // Listen for input changes to show suggestions
    const inputElement = document.getElementById('email-input') as HTMLInputElement
    if (!inputElement) return

    return add(inputElement, 'focus', () => {
      setShowSuggestions(true)
    })
  }, [add])

  return (
    <div>
      <form>
        <input
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div>
          <input
            id="email-input"
            placeholder="Email (Ctrl+S to save)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          {showSuggestions && (
            <div ref={suggestionsRef.ref}>
              <div>suggestion@example.com</div>
              <div>user@example.com</div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
