import React from 'react'
import styles from '../../styles/components/Progress.module.scss'

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0-100) */
  value?: number
  /** Buffer value for buffered progress (0-100) */
  valueBuffer?: number
  /** Variant determines the visual style */
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query'
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  /** @deprecated Use variant="indeterminate" instead */
  indeterminate?: boolean
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  value = 0,
  valueBuffer,
  variant,
  color = 'primary',
  indeterminate,
  className = '',
  ...props
}) => {
  // Support legacy indeterminate prop
  const effectiveVariant = variant || (indeterminate ? 'indeterminate' : 'determinate')
  const clampedValue = Math.min(100, Math.max(0, value))
  const clampedBuffer = valueBuffer !== undefined ? Math.min(100, Math.max(0, valueBuffer)) : undefined

  return (
    <div
      className={`${styles.linearProgress} ${styles[effectiveVariant]} ${styles[color]} ${className}`}
      role="progressbar"
      aria-valuenow={effectiveVariant === 'determinate' ? clampedValue : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      {effectiveVariant === 'buffer' && (
        <>
          <div className={styles.buffer} style={{ width: `${clampedBuffer ?? 0}%` }} />
          <div className={styles.dashed} />
        </>
      )}
      <div
        className={styles.bar}
        style={effectiveVariant === 'determinate' || effectiveVariant === 'buffer'
          ? { width: `${clampedValue}%` }
          : undefined
        }
      />
      {(effectiveVariant === 'indeterminate' || effectiveVariant === 'query') && (
        <div className={styles.bar2} />
      )}
    </div>
  )
}

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0-100) for determinate variant */
  value?: number
  /** Variant determines the visual style */
  variant?: 'determinate' | 'indeterminate'
  /** Size of the progress circle */
  size?: number | string
  /** Thickness of the progress circle stroke */
  thickness?: number
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'inherit'
  /** Disable shrink animation on indeterminate */
  disableShrink?: boolean
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  variant = 'indeterminate',
  size = 40,
  thickness = 3.6,
  color = 'primary',
  disableShrink = false,
  className = '',
  style,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value))
  const circumference = 2 * Math.PI * ((44 - thickness) / 2)
  const strokeDasharray = circumference.toFixed(3)
  const strokeDashoffset = variant === 'determinate'
    ? (((100 - clampedValue) / 100) * circumference).toFixed(3)
    : undefined

  return (
    <div
      className={`${styles.circularProgress} ${styles[variant]} ${styles[`circular-${color}`]} ${disableShrink ? styles.disableShrink : ''} ${className}`}
      role="progressbar"
      aria-valuenow={variant === 'determinate' ? clampedValue : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        ...style,
      }}
      {...props}
    >
      <svg viewBox="0 0 44 44" className={styles.svg}>
        {/* Background circle (track) */}
        <circle
          className={styles.track}
          cx={22}
          cy={22}
          r={(44 - thickness) / 2}
          fill="none"
          strokeWidth={thickness}
        />
        {/* Progress circle */}
        <circle
          className={styles.circle}
          cx={22}
          cy={22}
          r={(44 - thickness) / 2}
          fill="none"
          strokeWidth={thickness}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  )
}

export const Progress = LinearProgress // alias
