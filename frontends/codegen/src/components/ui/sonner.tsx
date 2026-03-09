'use client'

import { useEffect, useState, useCallback, ComponentProps } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Info, Warning, Spinner } from '@metabuilder/fakemui/icons'

// --- Toast types and state ---
// Uses globalThis to guarantee singleton state across webpack/turbopack chunks.
// Without this, module-level variables may be duplicated when the same file
// is bundled into separate chunks (e.g. layout.tsx vs useProjectManagerDropdown.ts).

type ToastType = 'default' | 'success' | 'error' | 'info' | 'warning' | 'loading'

interface ToastData {
  id: string
  message: string
  description?: string
  type: ToastType
  duration?: number
  dismissible?: boolean
}

type Listener = () => void

interface ToastState {
  nextId: number
  toasts: ToastData[]
  listeners: Set<Listener>
}

const TOAST_KEY = '__metabuilder_toast_state__' as const

function getState(): ToastState {
  const g = globalThis as unknown as Record<string, ToastState>
  if (!g[TOAST_KEY]) {
    g[TOAST_KEY] = { nextId: 0, toasts: [], listeners: new Set() }
  }
  return g[TOAST_KEY]
}

function emit() {
  getState().listeners.forEach((l) => l())
}

function addToast(message: string, type: ToastType = 'default', opts?: { description?: string; duration?: number; dismissible?: boolean }): string {
  const state = getState()
  const id = String(++state.nextId)
  state.toasts = [...state.toasts, { id, message, type, description: opts?.description, duration: opts?.duration, dismissible: opts?.dismissible ?? true }]
  emit()
  return id
}

function dismissToast(id: string) {
  const state = getState()
  state.toasts = state.toasts.filter((t) => t.id !== id)
  emit()
}

// --- Public toast API (sonner-compatible) ---

function toast(message: string, opts?: { description?: string; duration?: number }) {
  return addToast(message, 'default', opts)
}
toast.success = (message: string, opts?: { description?: string; duration?: number }) =>
  addToast(message, 'success', opts)
toast.error = (message: string, opts?: { description?: string; duration?: number }) =>
  addToast(message, 'error', opts)
toast.info = (message: string, opts?: { description?: string; duration?: number }) =>
  addToast(message, 'info', opts)
toast.warning = (message: string, opts?: { description?: string; duration?: number }) =>
  addToast(message, 'warning', opts)
toast.loading = (message: string, opts?: { description?: string; duration?: number }) =>
  addToast(message, 'loading', { ...opts, duration: opts?.duration ?? Infinity })
toast.dismiss = (id: string) => dismissToast(id)
toast.promise = <T,>(
  promise: Promise<T>,
  opts: { loading: string; success: string; error: string }
): Promise<T> => {
  const id = addToast(opts.loading, 'loading', { duration: Infinity })
  promise
    .then(() => {
      dismissToast(id)
      addToast(opts.success, 'success')
    })
    .catch(() => {
      dismissToast(id)
      addToast(opts.error, 'error')
    })
  return promise
}

// --- Subscribe hook ---

function useToastStore() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const state = getState()
    const listener = () => setTick((t) => t + 1)
    state.listeners.add(listener)
    return () => { state.listeners.delete(listener) }
  }, [])

  return getState().toasts
}

// --- Icon colors per type ---

const typeIconColor: Record<ToastType, string> = {
  default: 'var(--mat-sys-on-surface)',
  success: '#22c55e',
  error: '#ef4444',
  info: '#3b82f6',
  warning: '#eab308',
  loading: 'var(--mat-sys-on-surface-variant)',
}

const typeBorderColor: Record<ToastType, string> = {
  default: 'var(--mat-sys-outline-variant)',
  success: 'rgba(34, 197, 94, 0.3)',
  error: 'rgba(239, 68, 68, 0.3)',
  info: 'rgba(59, 130, 246, 0.3)',
  warning: 'rgba(234, 179, 8, 0.3)',
  loading: 'var(--mat-sys-outline-variant)',
}

function TypeIcon({ type }: { type: ToastType }) {
  const color = typeIconColor[type]
  const iconStyle = { width: 16, height: 16, color, flexShrink: 0 } as const
  switch (type) {
    case 'success': return <Check style={iconStyle} />
    case 'error': return <X style={iconStyle} />
    case 'info': return <Info style={iconStyle} />
    case 'warning': return <Warning style={iconStyle} />
    case 'loading': return <Spinner style={{ ...iconStyle, animation: 'spin 1s linear infinite' }} />
    default: return null
  }
}

// --- Individual toast ---

function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: (id: string) => void }) {
  const duration = data.duration ?? (data.type === 'error' ? 6000 : 4000)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (duration === Infinity) return
    const t = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(data.id), 200)
    }, duration)
    return () => clearTimeout(t)
  }, [duration, data.id, onDismiss])

  const itemStyle: React.CSSProperties = {
    pointerEvents: 'auto',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '8px',
    border: `1px solid ${typeBorderColor[data.type]}`,
    background: 'var(--mat-sys-surface-container)',
    padding: '12px 16px',
    color: 'var(--mat-sys-on-surface)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    opacity: exiting ? 0 : 1,
    transform: exiting ? 'translateX(100%)' : 'translateX(0)',
  }

  return (
    <div data-slot="toast" style={itemStyle}>
      <TypeIcon type={data.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{data.message}</p>
        {data.description && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mat-sys-on-surface-variant)' }}>{data.description}</p>
        )}
      </div>
      {data.dismissible !== false && (
        <button
          onClick={() => { setExiting(true); setTimeout(() => onDismiss(data.id), 200) }}
          style={{
            flexShrink: 0,
            borderRadius: '4px',
            padding: '4px',
            border: 'none',
            background: 'transparent',
            color: 'var(--mat-sys-on-surface-variant)',
            cursor: 'pointer',
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  )
}

// --- Toaster container ---

interface ToasterProps extends ComponentProps<'div'> {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  theme?: string
}

const positionStyles: Record<string, React.CSSProperties> = {
  'top-left': { top: 16, left: 16 },
  'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
  'top-right': { top: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 16, right: 16 },
}

function Toaster({ position = 'bottom-right', style, ...props }: ToasterProps) {
  const items = useToastStore()
  const [mounted, setMounted] = useState(false)
  const handleDismiss = useCallback((id: string) => dismissToast(id), [])

  useEffect(() => { setMounted(true) }, [])
  if (!mounted || items.length === 0) return null

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '356px',
    maxHeight: '100vh',
    pointerEvents: 'none',
    ...positionStyles[position],
    ...style,
  }

  return createPortal(
    <div data-slot="toaster" style={containerStyle} {...props}>
      {items.map((t) => (
        <ToastItem key={t.id} data={t} onDismiss={handleDismiss} />
      ))}
    </div>,
    document.body
  )
}

export { Toaster, toast }
export type { ToasterProps }
