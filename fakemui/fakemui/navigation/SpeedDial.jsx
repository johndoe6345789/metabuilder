import React, { useState } from 'react'
import { classNames } from '../utils/classNames'

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
  ...props
}) {
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
      className={classNames(
        'fakemui-speed-dial',
        `fakemui-speed-dial-direction-${direction}`,
        className,
        {
          'fakemui-speed-dial-hidden': hidden,
          'fakemui-speed-dial-open': isOpen,
        }
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
      {...props}
    >
      <button
        className={classNames('fakemui-speed-dial-fab', FabProps.className)}
        onClick={handleToggle}
        aria-expanded={isOpen}
        {...FabProps}
      >
        {isOpen && openIcon ? openIcon : icon}
      </button>
      <div className="fakemui-speed-dial-actions">{isOpen && children}</div>
    </div>
  )
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
}) {
  const [showTooltip, setShowTooltip] = useState(tooltipOpen)

  return (
    <div
      className={classNames('fakemui-speed-dial-action', className)}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      {(showTooltip || tooltipOpen) && tooltipTitle && (
        <span
          className={classNames(
            'fakemui-speed-dial-action-tooltip',
            `fakemui-speed-dial-action-tooltip-${tooltipPlacement}`,
            TooltipClasses.tooltip
          )}
        >
          {tooltipTitle}
        </span>
      )}
      <button
        className={classNames('fakemui-speed-dial-action-fab', FabProps.className)}
        onClick={onClick}
        aria-label={tooltipTitle}
        {...FabProps}
      >
        {icon}
      </button>
    </div>
  )
}

export function SpeedDialIcon({ icon, openIcon, open = false, className, ...props }) {
  return (
    <span
      className={classNames('fakemui-speed-dial-icon', className, {
        'fakemui-speed-dial-icon-open': open,
      })}
      {...props}
    >
      {open && openIcon ? openIcon : icon || '+'}
    </span>
  )
}

export default SpeedDial
