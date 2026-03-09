'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { classNames } from '../utils/classNames'
import styles from '../../../scss/atoms/mat-snackbar.module.scss'

/** Resolve CSS module class names with fallback to raw string */
const s = (key: string): string => styles[key] || key

export interface SnackbarAnchorOrigin {
  vertical?: 'top' | 'bottom'
  horizontal?: 'left' | 'center' | 'right'
}

export interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to display */
  children?: React.ReactNode
  /** Whether the snackbar is visible */
  open?: boolean
  /** Position on screen */
  anchorOrigin?: SnackbarAnchorOrigin
  /** Auto-hide duration in ms (null to disable) */
  autoHideDuration?: number | null
  /** Callback when snackbar should close */
  onClose?: (event: React.SyntheticEvent | Event | null, reason: 'timeout' | 'clickaway' | 'escapeKeyDown') => void
  /** Simple message to display (alternative to children) */
  message?: React.ReactNode
  /** Action button/element to display */
  action?: React.ReactNode
  /** Resume hide timer on interaction */
  resumeHideDuration?: number
  /** Transition duration in ms */
  transitionDuration?: number
  /** Test ID for testing */
  testId?: string
}

/**
 * Get position class based on anchor origin
 * Maps to React-specific position classes that work with Angular Material snackbar styles
 */
function getPositionClass(anchorOrigin: SnackbarAnchorOrigin): string | undefined {
  const { vertical = 'bottom', horizontal = 'left' } = anchorOrigin

  if (vertical === 'top') {
    if (horizontal === 'left') return styles.snackbarTopLeft
    if (horizontal === 'right') return styles.snackbarTopRight
    return styles.snackbarTop // center
  }

  // bottom
  if (horizontal === 'left') return styles.snackbarBottomLeft
  if (horizontal === 'right') return styles.snackbarBottomRight
  return styles.snackbarBottom // center
}

export const Snackbar: React.FC<SnackbarProps> = ({
  children,
  open = false,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  autoHideDuration = null,
  onClose,
  message,
  action,
  resumeHideDuration,
  transitionDuration = 150,
  className = '',
  testId,
  ...props
}) => {
  const [exiting, setExiting] = useState(false)
  const [visible, setVisible] = useState(false)

  const handleClose = useCallback(
    (reason: 'timeout' | 'clickaway' | 'escapeKeyDown') => {
      onClose?.(null, reason)
    },
    [onClose]
  )

  // Handle visibility and animation states
  useEffect(() => {
    if (open) {
      setVisible(true)
      setExiting(false)
    }
  }, [open])

  // Auto-hide timer
  useEffect(() => {
    if (!open || autoHideDuration === null) return

    const timer = setTimeout(() => {
      handleClose('timeout')
    }, autoHideDuration)

    return () => clearTimeout(timer)
  }, [open, autoHideDuration, handleClose])

  // Escape key handler
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose('escapeKeyDown')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleClose])

  // Exit animation
  useEffect(() => {
    if (!open && visible) {
      setExiting(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setExiting(false)
      }, 75) // Match Angular Material exit duration
      return () => clearTimeout(timer)
    }
    return undefined
  }, [open, visible])

  if (!visible) return null

  // Wrapper classes for positioning (React-specific)
  const wrapperClass = classNames(
    styles.snackbarWrapper,
    getPositionClass(anchorOrigin),
    styles.snackbarAnimationsEnabled,
    {
      [styles.snackbarEnter]: open && !exiting,
      [styles.snackbarExit]: exiting,
    },
    className
  )

  const content = children || (
    <SnackbarContent message={message} action={action} />
  )

  return (
    <div
      className={wrapperClass}
      data-testid={testId}
      role="status"
      aria-live="polite"
      {...props}
    >
      {/* Angular Material container structure */}
      <div className={s('mat-mdc-snack-bar-container')}>
        <div className={s('mat-mdc-snackbar-surface')}>
          {content}
        </div>
      </div>
    </div>
  )
}

export interface SnackbarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message to display */
  message?: React.ReactNode
  /** Action element */
  action?: React.ReactNode
  /** Severity/color variant */
  severity?: 'success' | 'error' | 'warning' | 'info'
}

/**
 * Get severity class for color variants
 */
function getSeverityClass(severity?: 'success' | 'error' | 'warning' | 'info'): string | undefined {
  if (!severity) return undefined
  switch (severity) {
    case 'success': return styles.snackbarSuccess
    case 'error': return styles.snackbarError
    case 'warning': return styles.snackbarWarning
    case 'info': return styles.snackbarInfo
    default: return undefined
  }
}

export const SnackbarContent: React.FC<SnackbarContentProps> = ({
  message,
  action,
  severity,
  className = '',
  ...props
}) => {
  const rootClass = classNames(
    s('mat-mdc-simple-snack-bar'),
    getSeverityClass(severity),
    className
  )

  return (
    <div className={rootClass} role="alert" {...props}>
      {message && (
        <div className={classNames(s('mdc-snackbar__label'), s('mat-mdc-snack-bar-label'))}>
          {message}
        </div>
      )}
      {action && (
        <div className={s('mat-mdc-snack-bar-actions')}>
          {action}
        </div>
      )}
    </div>
  )
}
