import React from 'react'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/mat-chip.module.scss'

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
  /** Disabled state */
  disabled?: boolean
  /** Test ID for automated testing */
  testId?: string
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
  disabled,
  testId,
  className = '',
  sx,
  style,
  ...props
}) => {
  // Build class list using CSS module
  const classNames: string[] = [styles.chip]

  // Clickable state
  if (clickable) {
    classNames.push(styles.chipClickable)
  }

  // Variant classes
  if (variant === 'outlined' || outline) {
    classNames.push(styles.chipOutlined)
  }

  // Color classes (support both old boolean props and new color prop)
  if (color === 'primary') {
    classNames.push(styles.chipPrimary)
  } else if (color === 'secondary') {
    classNames.push(styles.chipSecondary)
  } else if (color === 'success' || success) {
    classNames.push(styles.chipSuccess)
  } else if (color === 'error' || error) {
    classNames.push(styles.chipError)
  } else if (color === 'warning' || warning) {
    classNames.push(styles.chipWarning)
  } else if (color === 'info' || info) {
    classNames.push(styles.chipInfo)
  }

  // Size classes
  if (size === 'small' || sm) {
    classNames.push(styles.chipSmall)
  }

  // Deletable chip has different padding
  if (onDelete) {
    classNames.push(styles.chipDeletable)
  }

  // Disabled state
  if (disabled) {
    classNames.push(styles.chipDisabled)
  }

  // Add custom className
  if (className) {
    classNames.push(className)
  }

  // Use label prop if provided, otherwise use children
  const content = label ?? children

  return (
    <span
      className={classNames.join(' ')}
      style={{ ...sxToStyle(sx), ...style }}
      data-testid={testId}
      role={(clickable || onDelete) ? 'button' : undefined}
      {...props}
    >
      {icon && (
        <span className={`${styles.chipIcon} ${styles.chipIconLeading}`}>
          {icon}
        </span>
      )}
      {content}
      {onDelete && (
        <button
          className={styles.chipDelete}
          onClick={onDelete}
          type="button"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  )
}
