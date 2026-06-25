import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/spinner.module.scss'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'onPrimary' | 'onSurface'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size variant: xs (16px), sm (24px), md (40px), lg (56px), xl (72px) */
  size?: SpinnerSize
  /** Color variant using M3 color tokens */
  color?: SpinnerColor
  /** @deprecated Use size="sm" instead */
  sm?: boolean
  /** @deprecated Use size="lg" instead */
  lg?: boolean
  /** Test ID for testing */
  testId?: string
}

const sizeClassMap: Record<SpinnerSize, string> = {
  xs: styles.spinnerXs,
  sm: styles.spinnerSm,
  md: styles.spinnerMd,
  lg: styles.spinnerLg,
  xl: styles.spinnerXl,
}

const colorClassMap: Record<SpinnerColor, string | undefined> = {
  primary: undefined, // primary is the default, no extra class needed
  secondary: styles.spinnerSecondary,
  tertiary: styles.spinnerTertiary,
  error: styles.spinnerError,
  onPrimary: styles.spinnerOnPrimary,
  onSurface: styles.spinnerOnSurface,
}

export const Spinner: React.FC<SpinnerProps> = ({
  size,
  color = 'primary',
  sm,
  lg,
  className,
  testId,
  ...props
}) => {
  // Handle deprecated boolean props for backward compatibility
  const resolvedSize = size ?? (sm ? 'sm' : lg ? 'lg' : 'md')

  const spinnerClass = classNames(
    styles.spinner,
    sizeClassMap[resolvedSize],
    colorClassMap[color],
    className
  )

  return <div className={spinnerClass} data-testid={testId} role="status" aria-label="Loading" {...props} />
}

/** SVG-based circular progress indicator with M3 animation */
export interface CircularProgressProps extends React.SVGAttributes<SVGSVGElement> {
  /** Size variant: xs (16px), sm (24px), md (40px), lg (56px), xl (72px) */
  size?: SpinnerSize
  /** Stroke width in pixels */
  strokeWidth?: number
}

const svgSizeMap: Record<SpinnerSize, number> = {
  xs: 16,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72,
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 'md',
  strokeWidth = 3,
  className,
  ...props
}) => {
  const dimension = svgSizeMap[size]
  const radius = (dimension - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <svg
      className={classNames(styles.circularProgress, className)}
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      {...props}
    >
      <circle
        className={styles.circularProgressCircle}
        cx={dimension / 2}
        cy={dimension / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
      />
    </svg>
  )
}

/** Full-screen or container overlay with centered spinner */
export interface SpinnerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the spinner */
  size?: SpinnerSize
  /** Color variant */
  color?: SpinnerColor
  /** Optional loading text below spinner */
  text?: string
}

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({
  size = 'lg',
  color = 'primary',
  text,
  className,
  ...props
}) => {
  return (
    <div className={classNames(styles.spinnerOverlay, className)} {...props}>
      {text ? (
        <div className={styles.spinnerText}>
          <Spinner size={size} color={color} />
          <span>{text}</span>
        </div>
      ) : (
        <Spinner size={size} color={color} />
      )}
    </div>
  )
}
