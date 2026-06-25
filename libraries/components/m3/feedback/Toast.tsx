'use client'

/**
 * Toast - Imperative toast notification system for FakeMUI
 *
 * Drop-in replacement for sonner with identical API surface:
 *   toast('message')
 *   toast.success('message')
 *   toast.error('message')
 *   toast.warning('message')
 *   toast.info('message')
 *   toast.dismiss(id?)
 *
 * Usage:
 *   // In providers/layout:
 *   <Toaster />
 *
 *   // In any component or hook (no React context needed):
 *   import { toast } from '@metabuilder/components/m3'
 *   toast.success('Saved!')
 */

import React, { useSyncExternalStore } from 'react'
import styles from '../../../scss/atoms/mat-toast.module.scss'

// ============================================================================
// Types
// ============================================================================

type ToastSeverity = 'success' | 'error' | 'warning' | 'info'

interface ToastEntry {
  id: string
  message: string
  severity: ToastSeverity
  duration: number
}

// ============================================================================
// External store (module-level — works outside React components)
// ============================================================================

let _listeners: Array<() => void> = []
let _toasts: ToastEntry[] = []
let _idCounter = 0
const _timers = new Map<string, ReturnType<typeof setTimeout>>()

function _subscribe(cb: () => void): () => void {
  _listeners = [..._listeners, cb]
  return () => {
    _listeners = _listeners.filter(l => l !== cb)
  }
}

function _getSnapshot(): ToastEntry[] {
  return _toasts
}

function _notify(): void {
  _listeners.forEach(l => l())
}

function _add(message: string, severity: ToastSeverity, duration = 4000): string {
  const id = `toast-${++_idCounter}`
  _toasts = [..._toasts, { id, message, severity, duration }]
  _notify()
  if (duration > 0) {
    _timers.set(id, setTimeout(() => _remove(id), duration))
  }
  return id
}

function _remove(id: string): void {
  clearTimeout(_timers.get(id))
  _timers.delete(id)
  _toasts = _toasts.filter(t => t.id !== id)
  _notify()
}

// ============================================================================
// Imperative API  (matches sonner's surface exactly)
// ============================================================================

function toast(message: string): string { return _add(message, 'info') }
toast.success = (message: string): string => _add(message, 'success')
toast.error   = (message: string): string => _add(message, 'error')
toast.warning = (message: string): string => _add(message, 'warning')
toast.info    = (message: string): string => _add(message, 'info')
toast.dismiss = (id?: string): void => {
  if (id) {
    _remove(id)
  } else {
    _toasts.forEach(t => { clearTimeout(_timers.get(t.id)); _timers.delete(t.id) })
    _toasts = []
    _notify()
  }
}

export { toast }

// ============================================================================
// Severity icon names (Material Symbols)
// ============================================================================

const ICONS: Record<ToastSeverity, string> = {
  success: 'check_circle',
  error:   'error',
  warning: 'warning',
  info:    'info',
}

// ============================================================================
// Single toast item
// ============================================================================

interface ToastItemProps {
  entry: ToastEntry
  onDismiss: () => void
}

function ToastItem({ entry, onDismiss }: ToastItemProps) {
  return (
    <div
      className={`${styles.toast} ${styles[entry.severity]}`}
      role={entry.severity === 'error' ? 'alert' : 'status'}
      aria-live={entry.severity === 'error' ? 'assertive' : 'polite'}
    >
      <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
        {ICONS[entry.severity]}
      </span>
      <span className={styles.message}>{entry.message}</span>
      <button
        type="button"
        className={styles.dismiss}
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </div>
  )
}

// ============================================================================
// Toaster — place once near the root, like <Toaster /> from sonner
// ============================================================================

export interface ToasterProps {
  /** Screen position (default: bottom-right) */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  /** Test ID for testing */
  testId?: string
}

export function Toaster({ position = 'bottom-right', testId }: ToasterProps) {
  const toasts = useSyncExternalStore(_subscribe, _getSnapshot, () => [] as ToastEntry[])

  if (toasts.length === 0) return null

  return (
    <div className={`${styles.container} ${styles[position.replace(/-/g, '_')]}`} data-testid={testId} role="alert" aria-live="assertive" aria-label="Notifications">
      {toasts.map(entry => (
        <ToastItem key={entry.id} entry={entry} onDismiss={() => _remove(entry.id)} />
      ))}
    </div>
  )
}
