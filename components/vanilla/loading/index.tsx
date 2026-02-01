'use client'

import React from 'react'

/**
 * Loading Indicator Component
 *
 * Shows progress during async operations.
 * Supports different display modes: spinner, bar, dots, etc.
 */

export interface LoadingIndicatorProps {
  /**
   * Whether to show the loading indicator
   * @default true
   */
  show?: boolean

  /**
   * Loading message to display
   */
  message?: string

  /**
   * Variant: 'spinner', 'bar', 'dots', 'pulse'
   * @default 'spinner'
   */
  variant?: 'spinner' | 'bar' | 'dots' | 'pulse'

  /**
   * Size of the indicator: 'small', 'medium', 'large'
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Whether to show full page overlay
   * @default false
   */
  fullPage?: boolean

  /**
   * CSS class name for custom styling
   */
  className?: string

  /**
   * Custom style overrides
   */
  style?: React.CSSProperties
}

export function LoadingIndicator({
  show = true,
  message,
  variant = 'spinner',
  size = 'medium',
  fullPage = false,
  className,
  style,
}: LoadingIndicatorProps) {
  if (!show) {
    return null
  }

  const sizeMap = {
    small: '24px',
    medium: '40px',
    large: '60px',
  }

  const containerStyle: React.CSSProperties = fullPage
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        ...style,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        ...style,
      }

  return (
    <div className={`loading-indicator loading-${variant} ${className ?? ''}`} style={containerStyle}>
      {variant === 'spinner' && <SpinnerIcon size={sizeMap[size]} />}
      {variant === 'bar' && <ProgressBar size={size} />}
      {variant === 'dots' && <DotsAnimation size={size} />}
      {variant === 'pulse' && <PulseIcon size={sizeMap[size]} />}

      {message && (
        <p
          style={{
            marginTop: variant === 'spinner' || variant === 'pulse' ? '16px' : '12px',
            color: fullPage ? '#ffffff' : '#495057',
            fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * Spinner icon component
 */
interface IconProps {
  size: string
}

function SpinnerIcon({ size }: IconProps) {
  return (
    <div
      className="loading-spinner"
      style={{
        width: size,
        height: size,
        border: '3px solid #e0e0e0',
        borderTopColor: '#228be6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  )
}

function PulseIcon({ size }: IconProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#228be6',
        animation: 'pulse-animation 2s ease-in-out infinite',
      }}
    />
  )
}

/**
 * Progress bar component
 */
interface ProgressBarProps {
  size: 'small' | 'medium' | 'large'
}

function ProgressBar({ size }: ProgressBarProps) {
  const heightMap = {
    small: '2px',
    medium: '4px',
    large: '6px',
  }

  return (
    <div
      style={{
        width: '200px',
        height: heightMap[size],
        backgroundColor: '#e0e0e0',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: '#228be6',
          animation: 'progress-animation 1.5s ease-in-out infinite',
          borderRadius: '2px',
        }}
      />
    </div>
  )
}

/**
 * Animated dots component
 */
interface DotsAnimationProps {
  size: 'small' | 'medium' | 'large'
}

function DotsAnimation({ size }: DotsAnimationProps) {
  const dotMap = {
    small: '6px',
    medium: '10px',
    large: '14px',
  }

  const dotSize = dotMap[size]

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: '#228be6',
            animation: `dots-animation 1.4s infinite`,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Inline loading spinner for buttons and text
 */
export interface InlineLoaderProps {
  loading?: boolean
  size?: 'small' | 'medium'
  style?: React.CSSProperties
}

export function InlineLoader({ loading = true, size = 'small', style }: InlineLoaderProps) {
  if (!loading) {
    return null
  }

  const sizeMap = {
    small: '16px',
    medium: '20px',
  }

  return (
    <div
      className="loading-spinner"
      style={{
        display: 'inline-block',
        width: sizeMap[size],
        height: sizeMap[size],
        border: '2px solid #e0e0e0',
        borderTopColor: '#228be6',
        borderRadius: '50%',
        marginRight: '8px',
        animation: 'spin 1s linear infinite',
        ...style,
      }}
    />
  )
}

/**
 * Loading state for async operations with skeleton fallback
 */
export interface AsyncLoadingProps {
  isLoading: boolean
  error?: Error | string | null
  children: React.ReactNode
  skeletonComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  loadingMessage?: string
}

export function AsyncLoading({
  isLoading,
  error,
  children,
  skeletonComponent,
  errorComponent,
  loadingMessage,
}: AsyncLoadingProps) {
  if (isLoading) {
    return skeletonComponent ?? <LoadingIndicator show message={loadingMessage} />
  }

  if (error) {
    return errorComponent ?? <div style={{ color: '#c92a2a', padding: '16px' }}>Error loading content</div>
  }

  return <>{children}</>
}

/**
 * CSS keyframes for animations - inject these styles in your app
 *
 * @example
 * // Add to your global CSS:
 * @keyframes spin {
 *   to { transform: rotate(360deg); }
 * }
 * @keyframes pulse-animation {
 *   0%, 100% { opacity: 1; transform: scale(1); }
 *   50% { opacity: 0.5; transform: scale(0.8); }
 * }
 * @keyframes progress-animation {
 *   0% { width: 0%; }
 *   50% { width: 70%; }
 *   100% { width: 100%; }
 * }
 * @keyframes dots-animation {
 *   0%, 80%, 100% { opacity: 0; transform: scale(0); }
 *   40% { opacity: 1; transform: scale(1); }
 * }
 */
export const loadingStyles = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse-animation {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
@keyframes progress-animation {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}
@keyframes dots-animation {
  0%, 80%, 100% { opacity: 0; transform: scale(0); }
  40% { opacity: 1; transform: scale(1); }
}
`
