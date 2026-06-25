/**
 * Keyboard Shortcuts Dialog
 * Generic dialog for displaying keyboard shortcuts - accepts shortcuts as props
 *
 * Usage:
 * ```tsx
 * const shortcuts = [
 *   {
 *     category: 'Navigation',
 *     items: [
 *       { keys: ['Ctrl', '1'], description: 'Go to Dashboard' },
 *       { keys: ['Ctrl', 'K'], description: 'Search' },
 *     ]
 *   },
 *   {
 *     category: 'Actions',
 *     items: [
 *       { keys: ['Ctrl', 'S'], description: 'Save' },
 *     ]
 *   }
 * ]
 *
 * <KeyboardShortcutsDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   shortcuts={shortcuts}
 * />
 * ```
 */

import React from 'react'

// =============================================================================
// TYPES
// =============================================================================

export interface ShortcutItem {
  /** Key combination (e.g., ['Ctrl', 'S'] or ['⌘', 'Shift', 'G']) */
  keys: string[]
  /** Description of what the shortcut does */
  description: string
}

export interface ShortcutCategory {
  /** Category name (e.g., 'Navigation', 'Actions', 'Editor') */
  category: string
  /** Shortcuts in this category */
  items: ShortcutItem[]
}

export interface KeyboardShortcutsDialogProps {
  /** Whether dialog is open */
  open: boolean
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void
  /** Grouped shortcuts to display */
  shortcuts: ShortcutCategory[]
  /** Dialog title */
  title?: string
  /** Dialog description */
  description?: string
  /** Icon component to show in header */
  icon?: React.ReactNode
  /** Custom className for dialog content */
  className?: string
}

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Single shortcut row showing keys and description
 */
export function ShortcutRow({ keys, description }: ShortcutItem) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
      }}
    >
      <span
        style={{
          fontSize: '14px',
          color: 'var(--color-muted-foreground, #666)',
        }}
      >
        {description}
      </span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {keys.map((key, index) => (
          <kbd
            key={index}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: 'var(--color-muted, #f1f1f1)',
              border: '1px solid var(--color-border, #e0e0e0)',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}

/**
 * Keyboard Shortcuts Dialog - generic version that accepts shortcuts as props
 *
 * Note: This is a vanilla React component. For Radix Dialog integration,
 * wrap this content in your project's Dialog components:
 *
 * ```tsx
 * import { Dialog, DialogContent } from '@/components/ui/dialog'
 *
 * <Dialog open={open} onOpenChange={onOpenChange}>
 *   <DialogContent>
 *     <KeyboardShortcutsContent shortcuts={shortcuts} />
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export function KeyboardShortcutsContent({
  shortcuts,
  title = 'Keyboard Shortcuts',
  description = 'Speed up your workflow with these shortcuts',
  icon,
}: Omit<KeyboardShortcutsDialogProps, 'open' | 'onOpenChange'>) {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '18px',
            fontWeight: 600,
            margin: 0,
          }}
        >
          {icon}
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-muted-foreground, #666)',
              marginTop: '4px',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Shortcut categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {shortcuts.map((category, categoryIndex) => (
          <div key={category.category}>
            <h3
              style={{
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              {category.category}
            </h3>
            <div>
              {category.items.map((item, itemIndex) => (
                <ShortcutRow key={itemIndex} {...item} />
              ))}
            </div>
            {categoryIndex < shortcuts.length - 1 && (
              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--color-border, #e0e0e0)',
                  marginTop: '16px',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Helper to detect platform and return appropriate modifier key
 */
export function getPlatformModifier(): string {
  if (typeof navigator !== 'undefined' && navigator.platform?.includes('Mac')) {
    return '⌘'
  }
  return 'Ctrl'
}

/**
 * Helper to create shortcuts with platform-aware modifier
 */
export function createShortcut(
  modifiers: ('ctrl' | 'shift' | 'alt')[],
  key: string,
  description: string
): ShortcutItem {
  const ctrlKey = getPlatformModifier()
  const keys = modifiers.map((mod) => {
    switch (mod) {
      case 'ctrl':
        return ctrlKey
      case 'shift':
        return 'Shift'
      case 'alt':
        return typeof navigator !== 'undefined' && navigator.platform?.includes('Mac')
          ? '⌥'
          : 'Alt'
    }
  })
  keys.push(key)

  return { keys, description }
}

export default KeyboardShortcutsContent
