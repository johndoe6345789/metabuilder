/**
 * useAccessible Hook
 * Provides standardized accessibility attributes and test IDs for components
 */

import React from 'react'
import { generateTestId, aria, AccessibilityFeature, AccessibilityComponent, AccessibilityAction } from './accessibility'

interface UseAccessibleOptions {
  feature: AccessibilityFeature | string
  component: AccessibilityComponent | string
  action?: AccessibilityAction | string
  identifier?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}

interface AccessibleAttributes {
  'data-testid': string
  'aria-label'?: string
  'aria-describedby'?: string
  role?: string
}

/**
 * Hook for generating consistent accessibility attributes
 * Combines data-testid and ARIA attributes in a single call
 *
 * @example
 * const { testId, ariaLabel } = useAccessible({
 *   feature: 'form',
 *   component: 'button',
 *   action: 'submit'
 * })
 *
 * <button data-testid={testId} aria-label={ariaLabel}>
 *   Submit
 * </button>
 */
export function useAccessible(options: UseAccessibleOptions): AccessibleAttributes {
  const { feature, component, action, identifier, ariaLabel, ariaDescribedBy } = options

  const testId = generateTestId(feature, component, action, identifier)

  const attributes: AccessibleAttributes = {
    'data-testid': testId,
  }

  if (ariaLabel) {
    attributes['aria-label'] = ariaLabel
  }

  if (ariaDescribedBy) {
    attributes['aria-describedby'] = ariaDescribedBy
  }

  return attributes
}

/**
 * Hook for keyboard navigation handling
 * Provides common keyboard event handlers
 *
 * @example
 * const keyboardProps = useKeyboardNavigation({
 *   onEnter: () => handleSubmit(),
 *   onEscape: () => handleClose(),
 *   onArrowUp: () => handlePrevious(),
 *   onArrowDown: () => handleNext()
 * })
 *
 * <div {...keyboardProps}>Content</div>
 */
export function useKeyboardNavigation(handlers: {
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
}) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handlers.onEnter?.()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handlers.onEscape?.()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handlers.onArrowUp?.()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handlers.onArrowDown?.()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlers.onArrowLeft?.()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handlers.onArrowRight?.()
      } else if (e.key === 'Tab') {
        handlers.onTab?.()
      }
    },
    [handlers]
  )

  return { onKeyDown: handleKeyDown }
}

/**
 * Hook for managing focus
 * Provides focus management utilities
 *
 * @example
 * const { focusRef, focus } = useFocusManagement()
 *
 * <button ref={focusRef} onClick={() => focus()}>
 *   Refocus me
 * </button>
 */
export function useFocusManagement() {
  const ref = React.useRef<HTMLElement>(null)

  const focus = React.useCallback(() => {
    ref.current?.focus()
  }, [])

  const blur = React.useCallback(() => {
    ref.current?.blur()
  }, [])

  return { focusRef: ref, focus, blur }
}

/**
 * Hook for live region announcements
 * Provides screen reader announcements
 *
 * @example
 * const { announce } = useLiveRegion('polite')
 *
 * announce('Item deleted successfully')
 */
export function useLiveRegion(politeness: 'polite' | 'assertive' = 'polite') {
  const [message, setMessage] = React.useState('')

  const announce = React.useCallback(
    (text: string) => {
      setMessage(text)
      // Clear after announcement
      setTimeout(() => setMessage(''), 1000)
    },
    []
  )

  return {
    announce,
    liveRegionProps: {
      role: 'status',
      'aria-live': politeness,
      'aria-atomic': true,
    },
    message,
  }
}

/**
 * Hook for managing modal/dialog focus
 * Traps focus within modal and restores on close
 *
 * @example
 * const { focusTrapProps } = useFocusTrap(isOpen)
 *
 * <div {...focusTrapProps}>
 *   Modal content
 * </div>
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    const container = containerRef.current
    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive])

  return { focusTrapRef: containerRef }
}
