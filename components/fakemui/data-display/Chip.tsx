import React from 'react'
import { sxToStyle } from '../utils/sx'

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Chip content (FakeMUI native) */
  children?: React.ReactNode
  /** Chip label text (MUI-compatible alias for children) */
  label?: React.ReactNode
  /** Icon displayed before the label */
  icon?: React.ReactNode
  /** Delete icon handler */
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Make chip clickable */
  clickable?: boolean
  /** Size variant */
  size?: 'small' | 'medium'
  /** @deprecated Use size="small" instead */
  sm?: boolean
  /** Color variant (MUI-style) */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  /** @deprecated Use color="success" instead */
  success?: boolean
  /** @deprecated Use color="error" instead */
  error?: boolean
  /** @deprecated Use color="warning" instead */
  warning?: boolean
  /** @deprecated Use color="info" instead */
  info?: boolean
  /** Outlined variant */
  variant?: 'filled' | 'outlined'
  /** @deprecated Use variant="outlined" instead */
  outline?: boolean
  /** MUI sx prop */
  sx?: Record<string, unknown>
}

export const Chip: React.FC<ChipProps> = ({
  children,
  label,
  icon,
  onDelete,
  clickable,
  size,
  sm,
  color,
  success,
  error,
  warning,
  info,
  variant,
  outline,
  className = '',
  sx,
  style,
  ...props
}) => {
  // Determine color class (support both old boolean props and new color prop)
  const colorClass = color
    ? `chip--${color}`
    : success ? 'chip--success'
    : error ? 'chip--error'
    : warning ? 'chip--warning'
    : info ? 'chip--info'
    : ''

  // Determine size class
  const sizeClass = size === 'small' || sm ? 'chip--sm' : ''

  // Determine variant class
  const variantClass = variant === 'outlined' || outline ? 'chip--outline' : ''

  // Use label prop if provided, otherwise use children
  const content = label ?? children

  return (
    <span
      className={`chip ${clickable ? 'chip--clickable' : ''} ${sizeClass} ${colorClass} ${variantClass} ${className}`}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    >
      {icon && <span className="chip-icon">{icon}</span>}
      {content}
      {onDelete && (
        <button className="chip-delete" onClick={onDelete}>
          ×
        </button>
      )}
    </span>
  )
}
