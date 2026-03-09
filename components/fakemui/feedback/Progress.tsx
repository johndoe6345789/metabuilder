import React from 'react'
import styles from '../../../scss/atoms/mat-progress.module.scss'

/** Resolve CSS Module hashed class names with raw-string fallback */
const s = (key: string): string => styles[key] || key

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
  /** Show label with percentage */
  showLabel?: boolean
  /** Size variant */
  size?: 'thin' | 'default' | 'thick'
  /** Test ID for testing */
  testId?: string
}

// Map color prop to CSS module class names
const colorClassMap: Record<string, string> = {
  primary: '',
  secondary: styles.colorSecondary,
  tertiary: styles.colorTertiary,
  success: styles.colorSuccess,
  warning: styles.colorWarning,
  error: styles.colorError,
  info: styles.colorInfo,
}

// Map size prop to CSS module class names
const sizeClassMap: Record<string, string> = {
  thin: styles.thin,
  default: '',
  thick: styles.thick,
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  value = 0,
  valueBuffer,
  variant,
  color = 'primary',
  indeterminate,
  showLabel = false,
  size = 'default',
  className = '',
  testId,
  ...props
}) => {
  // Support legacy indeterminate prop
  const effectiveVariant = variant || (indeterminate ? 'indeterminate' : 'determinate')
  const clampedValue = Math.min(100, Math.max(0, value))
  const clampedBuffer = valueBuffer !== undefined ? Math.min(100, Math.max(0, valueBuffer)) : undefined

  const colorClass = colorClassMap[color] || ''
  const sizeClass = sizeClassMap[size] || ''

  // Build class names using Angular Material M3 classes
  const containerClasses = [
    s('mat-mdc-progress-bar'),
    s('mdc-linear-progress'),
    styles.matProgress,
    colorClass,
    sizeClass,
    effectiveVariant === 'indeterminate' ? `${s('mdc-linear-progress--indeterminate')} ${s('mdc-linear-progress--animation-ready')}` : '',
    effectiveVariant === 'query' ? `${s('mdc-linear-progress--indeterminate')} ${s('mdc-linear-progress--animation-ready')}` : '',
    className,
  ].filter(Boolean).join(' ')

  const progressElement = (
    <div
      className={containerClasses}
      data-testid={testId}
      role="progressbar"
      aria-valuenow={effectiveVariant === 'determinate' || effectiveVariant === 'buffer' ? clampedValue : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      data-mode={effectiveVariant}
      {...(effectiveVariant === 'query' ? { mode: 'query' } : {})}
      {...props}
    >
      {/* Buffer container */}
      <div className={s('mdc-linear-progress__buffer')}>
        <div
          className={s('mdc-linear-progress__buffer-bar')}
          style={effectiveVariant === 'buffer' && clampedBuffer !== undefined
            ? { flexBasis: `${clampedBuffer}%` }
            : undefined
          }
        />
        <div className={s('mdc-linear-progress__buffer-dots')} />
      </div>

      {/* Primary bar */}
      <div
        className={`${s('mdc-linear-progress__bar')} ${s('mdc-linear-progress__primary-bar')}`}
        style={effectiveVariant === 'determinate' || effectiveVariant === 'buffer'
          ? { transform: `scaleX(${clampedValue / 100})` }
          : undefined
        }
      >
        <span className={s('mdc-linear-progress__bar-inner')} />
      </div>

      {/* Secondary bar (for indeterminate) */}
      <div className={`${s('mdc-linear-progress__bar')} ${s('mdc-linear-progress__secondary-bar')}`}>
        <span className={s('mdc-linear-progress__bar-inner')} />
      </div>
    </div>
  )

  if (showLabel) {
    return (
      <div className={styles.withLabel}>
        {progressElement}
        <span className={styles.label}>{Math.round(clampedValue)}%</span>
      </div>
    )
  }

  return progressElement
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
  /** Show label with percentage (only for determinate) */
  showLabel?: boolean
  /** Test ID for testing */
  testId?: string
}

// Map color prop to CSS module class names for circular progress
const circularColorClassMap: Record<string, string> = {
  primary: '',
  secondary: styles.colorSecondary,
  tertiary: styles.colorTertiary,
  success: styles.colorSuccess,
  warning: styles.colorWarning,
  error: styles.colorError,
  info: styles.colorInfo,
  inherit: styles.colorInherit,
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  variant = 'indeterminate',
  size = 40,
  thickness = 4,
  color = 'primary',
  showLabel = false,
  className = '',
  style,
  testId,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value))
  const numericSize = typeof size === 'number' ? size : 48
  const viewBoxSize = 48
  const radius = (viewBoxSize - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference.toFixed(3)
  const strokeDashoffset = variant === 'determinate'
    ? (((100 - clampedValue) / 100) * circumference).toFixed(3)
    : (0.75 * circumference).toFixed(3) // For indeterminate, show partial circle

  const colorClass = circularColorClassMap[color] || ''

  // Build class names using Angular Material M3 classes
  const containerClasses = [
    s('mat-mdc-progress-spinner'),
    styles.matProgress,
    colorClass,
    variant === 'indeterminate' ? s('mdc-circular-progress--indeterminate') : '',
    showLabel ? styles.circularWithLabel : '',
    className,
  ].filter(Boolean).join(' ')

  const progressElement = (
    <div
      className={containerClasses}
      data-testid={testId}
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
      {variant === 'determinate' ? (
        // Determinate container with single circle
        <div className={s('mdc-circular-progress__determinate-container')}>
          <svg
            className={s('mdc-circular-progress__determinate-circle-graphic')}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          >
            <circle
              className={s('mdc-circular-progress__determinate-circle')}
              cx={viewBoxSize / 2}
              cy={viewBoxSize / 2}
              r={radius}
              fill="none"
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
        </div>
      ) : (
        // Indeterminate container with spinner layer and circle clippers
        <div className={s('mdc-circular-progress__indeterminate-container')}>
          <div className={s('mdc-circular-progress__spinner-layer')}>
            <div className={`${s('mdc-circular-progress__circle-clipper')} ${s('mdc-circular-progress__circle-left')}`}>
              <svg
                className={s('mdc-circular-progress__indeterminate-circle-graphic')}
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              >
                <circle
                  cx={viewBoxSize / 2}
                  cy={viewBoxSize / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={thickness}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
            </div>
            <div className={s('mdc-circular-progress__gap-patch')}>
              <svg
                className={s('mdc-circular-progress__indeterminate-circle-graphic')}
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              >
                <circle
                  cx={viewBoxSize / 2}
                  cy={viewBoxSize / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={thickness * 0.8}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
            </div>
            <div className={`${s('mdc-circular-progress__circle-clipper')} ${s('mdc-circular-progress__circle-right')}`}>
              <svg
                className={s('mdc-circular-progress__indeterminate-circle-graphic')}
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              >
                <circle
                  cx={viewBoxSize / 2}
                  cy={viewBoxSize / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={thickness}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {showLabel && variant === 'determinate' && (
        <span className={styles.circularLabel}>
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  )

  return progressElement
}

export const Progress = LinearProgress // alias
