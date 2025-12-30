import React, { forwardRef } from 'react'
import { classNames } from '../utils/classNames'

/**
 * LoadingButton - A button with loading state
 */
export const LoadingButton = forwardRef(function LoadingButton(
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
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  const defaultLoadingIndicator = (
    <span className="fakemui-loading-button-spinner">
      <svg className="fakemui-loading-button-spinner-svg" viewBox="22 22 44 44">
        <circle
          className="fakemui-loading-button-spinner-circle"
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
          <span className="fakemui-loading-button-label-hidden">{children}</span>
          <span className="fakemui-loading-button-loading-indicator">{indicator}</span>
        </>
      )
    }

    return (
      <>
        {loading && loadingPosition === 'start' ? (
          <span className="fakemui-loading-button-loading-indicator-start">{indicator}</span>
        ) : (
          startIcon && <span className="fakemui-loading-button-start-icon">{startIcon}</span>
        )}
        {children}
        {loading && loadingPosition === 'end' ? (
          <span className="fakemui-loading-button-loading-indicator-end">{indicator}</span>
        ) : (
          endIcon && <span className="fakemui-loading-button-end-icon">{endIcon}</span>
        )}
      </>
    )
  }

  return (
    <button
      ref={ref}
      className={classNames(
        'fakemui-loading-button',
        `fakemui-loading-button-${variant}`,
        `fakemui-loading-button-${color}`,
        `fakemui-loading-button-${size}`,
        className,
        {
          'fakemui-loading-button-loading': loading,
          'fakemui-loading-button-disabled': isDisabled,
          'fakemui-loading-button-fullwidth': fullWidth,
        }
      )}
      disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </button>
  )
})

export default LoadingButton
