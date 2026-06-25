'use client'

import React, { useState } from 'react'
import { classNames } from '../utils/classNames'

export interface SpeedDialProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onMouseEnter' | 'onMouseLeave'> {
  ariaLabel?: string
  children?: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  hidden?: boolean
  icon?: React.ReactNode
  onClose?: () => void
  onOpen?: () => void
  open?: boolean
  openIcon?: React.ReactNode
  FabProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  /** Test ID for automated testing */
  testId?: string
}

export function SpeedDial({
  ariaLabel,
  children,
  direction = 'up',
  hidden = false,
  icon,
  onClose,
  onOpen,
  open: controlledOpen,
  openIcon,
  className,
  FabProps = {},
  testId,
  ...props
}: SpeedDialProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen

  const handleToggle = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(!internalOpen)
    }
    if (isOpen) {
      onClose?.()
    } else {
      onOpen?.()
    }
  }

  const handleMouseEnter = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(true)
    }
    onOpen?.()
  }

  const handleMouseLeave = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(false)
    }
    onClose?.()
  }

  return (
    <div
      className={classNames('m3-speed-dial', `m3-speed-dial-direction-${direction}`, className, {
        'm3-speed-dial-hidden': hidden,
        'm3-speed-dial-open': isOpen,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
      data-testid={testId}
      {...props}
    >
      <button
        className={classNames('m3-speed-dial-fab', FabProps.className)}
        onClick={handleToggle}
        aria-expanded={isOpen}
        {...FabProps}
      >
        {isOpen && openIcon ? openIcon : icon}
      </button>
      <div className="m3-speed-dial-actions">{isOpen && children}</div>
    </div>
  )
}

export interface SpeedDialActionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  icon?: React.ReactNode
  tooltipTitle?: string
  tooltipOpen?: boolean
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  delay?: number
  FabProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  TooltipClasses?: { tooltip?: string }
}

export function SpeedDialAction({
  icon,
  tooltipTitle,
  tooltipOpen = false,
  tooltipPlacement = 'left',
  onClick,
  delay = 0,
  className,
  FabProps = {},
  TooltipClasses = {},
  ...props
}: SpeedDialActionProps) {
  const [showTooltip, setShowTooltip] = useState(tooltipOpen)

  return (
    <div
      className={classNames('m3-speed-dial-action', className)}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      {(showTooltip || tooltipOpen) && tooltipTitle && (
        <span
          className={classNames(
            'm3-speed-dial-action-tooltip',
            `m3-speed-dial-action-tooltip-${tooltipPlacement}`,
            TooltipClasses.tooltip
          )}
        >
          {tooltipTitle}
        </span>
      )}
      <button
        className={classNames('m3-speed-dial-action-fab', FabProps.className)}
        onClick={onClick}
        aria-label={tooltipTitle}
        {...FabProps}
      >
        {icon}
      </button>
    </div>
  )
}

export interface SpeedDialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon?: React.ReactNode
  openIcon?: React.ReactNode
  open?: boolean
}

export function SpeedDialIcon({ icon, openIcon, open = false, className, ...props }: SpeedDialIconProps) {
  return (
    <span
      className={classNames('m3-speed-dial-icon', className, {
        'm3-speed-dial-icon-open': open,
      })}
      {...props}
    >
      {open && openIcon ? openIcon : icon || '+'}
    </span>
  )
}

export default SpeedDial
