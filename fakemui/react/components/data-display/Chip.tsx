import React from 'react'

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  icon?: React.ReactNode
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void
  clickable?: boolean
  sm?: boolean
  success?: boolean
  error?: boolean
  warning?: boolean
  info?: boolean
  outline?: boolean
}

export const Chip: React.FC<ChipProps> = ({
  children,
  icon,
  onDelete,
  clickable,
  sm,
  success,
  error,
  warning,
  info,
  outline,
  className = '',
  ...props
}) => (
  <span
    className={`chip ${clickable ? 'chip--clickable' : ''} ${sm ? 'chip--sm' : ''} ${success ? 'chip--success' : ''} ${error ? 'chip--error' : ''} ${warning ? 'chip--warning' : ''} ${info ? 'chip--info' : ''} ${outline ? 'chip--outline' : ''} ${className}`}
    {...props}
  >
    {icon && <span className="chip-icon">{icon}</span>}
    {children}
    {onDelete && (
      <button className="chip-delete" onClick={onDelete}>
        ×
      </button>
    )}
  </span>
)
