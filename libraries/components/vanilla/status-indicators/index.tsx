/**
 * Status Indicator Components
 * Generic components for displaying connection/backend status
 *
 * Usage:
 * ```tsx
 * // Basic connection status
 * <ConnectionStatus isConnected={true} label="API" />
 *
 * // Backend indicator with custom states
 * <BackendStatus
 *   status="connected"
 *   label="Flask Backend"
 *   showDot={true}
 * />
 *
 * // Custom status badge
 * <StatusBadge
 *   variant="success"
 *   label="Online"
 *   icon={<CheckIcon />}
 * />
 * ```
 */

import React from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral'

export type BackendStatusType = 'connected' | 'disconnected' | 'connecting' | 'error'

export interface StatusBadgeProps {
  /** Visual variant */
  variant: StatusVariant
  /** Label text */
  label: string
  /** Optional icon (renders before label) */
  icon?: React.ReactNode
  /** Show pulsing dot indicator */
  showDot?: boolean
  /** Additional className */
  className?: string
  /** Tooltip text */
  tooltip?: string
}

export interface ConnectionStatusProps {
  /** Whether connected */
  isConnected: boolean
  /** Label for connected state */
  connectedLabel?: string
  /** Label for disconnected state */
  disconnectedLabel?: string
  /** Show icon */
  showIcon?: boolean
  /** Additional className */
  className?: string
}

export interface BackendStatusProps {
  /** Current status */
  status: BackendStatusType
  /** Backend name/label */
  label?: string
  /** Show pulsing activity dot */
  showDot?: boolean
  /** Tooltip for connected state */
  connectedTooltip?: string
  /** Tooltip for disconnected state */
  disconnectedTooltip?: string
  /** Additional className */
  className?: string
}

// =============================================================================
// STYLES
// =============================================================================

const variantStyles: Record<StatusVariant, { bg: string; border: string; text: string; dot: string }> = {
  success: {
    bg: 'rgba(46, 125, 50, 0.1)',
    border: 'rgba(46, 125, 50, 0.3)',
    text: 'var(--color-success, #2e7d32)',
    dot: 'var(--color-success, #2e7d32)',
  },
  error: {
    bg: 'rgba(211, 47, 47, 0.1)',
    border: 'rgba(211, 47, 47, 0.3)',
    text: 'var(--color-error, #d32f2f)',
    dot: 'var(--color-error, #d32f2f)',
  },
  warning: {
    bg: 'rgba(245, 127, 0, 0.1)',
    border: 'rgba(245, 127, 0, 0.3)',
    text: 'var(--color-warning, #f57f00)',
    dot: 'var(--color-warning, #f57f00)',
  },
  info: {
    bg: 'rgba(2, 136, 209, 0.1)',
    border: 'rgba(2, 136, 209, 0.3)',
    text: 'var(--color-info, #0288d1)',
    dot: 'var(--color-info, #0288d1)',
  },
  neutral: {
    bg: 'rgba(128, 128, 128, 0.1)',
    border: 'rgba(128, 128, 128, 0.3)',
    text: 'var(--color-muted, #666)',
    dot: 'var(--color-muted, #666)',
  },
}

const statusToVariant: Record<BackendStatusType, StatusVariant> = {
  connected: 'success',
  disconnected: 'neutral',
  connecting: 'info',
  error: 'error',
}

// =============================================================================
// ICONS
// =============================================================================

const CloudIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
)

const CloudOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z" />
  </svg>
)

const DatabaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

const SpinnerIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ animation: 'status-spin 1s linear infinite' }}
  >
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
)

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Generic status badge component
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  icon,
  showDot,
  className,
  tooltip,
}) => {
  const styles = variantStyles[variant]

  const badge = (
    <div
      role="status"
      aria-label={`Status: ${label}`}
      data-testid="status-badge"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '9999px',
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.text,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{label}</span>
      {showDot && (
        <span
          aria-hidden="true"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: styles.dot,
            animation: 'status-pulse 2s ease-in-out infinite',
          }}
        />
      )}
    </div>
  )

  if (tooltip) {
    return <span title={tooltip}>{badge}</span>
  }

  return badge
}

/**
 * Simple connected/disconnected status indicator
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  connectedLabel = 'Connected',
  disconnectedLabel = 'Disconnected',
  showIcon = true,
  className,
}) => {
  return (
    <StatusBadge
      variant={isConnected ? 'success' : 'neutral'}
      label={isConnected ? connectedLabel : disconnectedLabel}
      icon={showIcon ? (isConnected ? <CloudIcon /> : <CloudOffIcon />) : undefined}
      showDot={isConnected}
      className={className}
    />
  )
}

/**
 * Backend status indicator with multiple states
 */
export const BackendStatus: React.FC<BackendStatusProps> = ({
  status,
  label,
  showDot = true,
  connectedTooltip = 'Connected to backend',
  disconnectedTooltip = 'Using local storage',
  className,
}) => {
  const variant = statusToVariant[status]

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <CloudIcon />
      case 'disconnected':
        return <DatabaseIcon />
      case 'connecting':
        return <SpinnerIcon />
      case 'error':
        return <CloudOffIcon />
    }
  }

  const getLabel = () => {
    if (label) return label
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Local'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Error'
    }
  }

  const getTooltip = () => {
    switch (status) {
      case 'connected':
        return connectedTooltip
      case 'disconnected':
        return disconnectedTooltip
      case 'connecting':
        return 'Establishing connection...'
      case 'error':
        return 'Connection failed'
    }
  }

  return (
    <StatusBadge
      variant={variant}
      label={getLabel()}
      icon={getIcon()}
      showDot={showDot && status === 'connected'}
      tooltip={getTooltip()}
      className={className}
    />
  )
}

// =============================================================================
// STYLES (CSS-in-JS keyframes)
// =============================================================================

export const statusIndicatorStyles = `
@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes status-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  [data-testid="status-badge"] span {
    animation: none;
  }
}
`

export default StatusBadge
