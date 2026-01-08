import React, { useEffect, useCallback, useState } from 'react'
import { classNames } from '../utils/classNames'

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
  transitionDuration = 225,
  className = '',
  ...props
}) => {
  const [exiting, setExiting] = useState(false)

  const handleClose = useCallback(
    (reason: 'timeout' | 'clickaway' | 'escapeKeyDown') => {
      onClose?.(null, reason)
    },
    [onClose]
  )

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
    if (!open && !exiting) return undefined
    if (!open) {
      setExiting(true)
      const timer = setTimeout(() => setExiting(false), transitionDuration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [open, exiting, transitionDuration])

  if (!open && !exiting) return null

  const rootClass = classNames(
    'fakemui-snackbar',
    `fakemui-snackbar--${anchorOrigin.vertical}`,
    `fakemui-snackbar--${anchorOrigin.horizontal}`,
    {
      'fakemui-snackbar--open': open,
      'fakemui-snackbar--exiting': exiting && !open,
    },
    className
  )

  const content = children || (
    <SnackbarContent message={message} action={action} />
  )

  return (
    <div
      className={rootClass}
      role="alert"
      aria-live="polite"
      style={{ '--transition-duration': `${transitionDuration}ms` } as React.CSSProperties}
      {...props}
    >
      {content}
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

export const SnackbarContent: React.FC<SnackbarContentProps> = ({
  message,
  action,
  severity,
  className = '',
  ...props
}) => {
  const rootClass = classNames(
    'fakemui-snackbar-content',
    severity && `fakemui-snackbar-content--${severity}`,
    className
  )

  return (
    <div className={rootClass} role="alert" {...props}>
      {message && <div className="fakemui-snackbar-message">{message}</div>}
      {action && <div className="fakemui-snackbar-action">{action}</div>}
    </div>
  )
}
