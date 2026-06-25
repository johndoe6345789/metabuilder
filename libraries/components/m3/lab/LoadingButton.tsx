import React, { forwardRef } from 'react'
import { classNames } from '../utils/classNames'

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  loading?: boolean
  loadingIndicator?: React.ReactNode
  loadingPosition?: 'start' | 'end' | 'center'
  disabled?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  variant?: 'text' | 'outlined' | 'contained'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  /** Test ID for automated testing */
  testId?: string
}

/**
 * LoadingButton - A button with loading state
 */
export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(function LoadingButton(
  {
    children,
    loading = false,
    loadingIndicator,
    loadingPosition = 'center',
    disabled,
    startIcon,
    endIcon,
    variant = 'contained',
    color = 'primary',
    size = 'medium',
    fullWidth = false,
    className,
    testId,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  const defaultLoadingIndicator = (
    <span className="m3-loading-button-spinner">
      <svg className="m3-loading-button-spinner-svg" viewBox="22 22 44 44">
        <circle
          className="m3-loading-button-spinner-circle"
          cx="44"
          cy="44"
          r="20.2"
          fill="none"
          strokeWidth="3.6"
        />
      </svg>
    </span>
  )

  const indicator = loadingIndicator || defaultLoadingIndicator

  const renderContent = () => {
    if (loading && loadingPosition === 'center') {
      return (
        <>
          <span className="m3-loading-button-label-hidden">{children}</span>
          <span className="m3-loading-button-loading-indicator">{indicator}</span>
        </>
      )
    }

    return (
      <>
        {loading && loadingPosition === 'start' ? (
          <span className="m3-loading-button-loading-indicator-start">{indicator}</span>
        ) : (
          startIcon && <span className="m3-loading-button-start-icon">{startIcon}</span>
        )}
        {children}
        {loading && loadingPosition === 'end' ? (
          <span className="m3-loading-button-loading-indicator-end">{indicator}</span>
        ) : (
          endIcon && <span className="m3-loading-button-end-icon">{endIcon}</span>
        )}
      </>
    )
  }

  return (
    <button
      ref={ref}
      className={classNames(
        'm3-loading-button',
        `m3-loading-button-${variant}`,
        `m3-loading-button-${color}`,
        `m3-loading-button-${size}`,
        className,
        {
          'm3-loading-button-loading': loading,
          'm3-loading-button-disabled': isDisabled,
          'm3-loading-button-fullwidth': fullWidth,
        }
      )}
      disabled={isDisabled}
      aria-busy={loading}
      data-testid={testId}
      {...props}
    >
      {renderContent()}
    </button>
  )
})

export default LoadingButton
