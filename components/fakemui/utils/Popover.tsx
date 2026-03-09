import React from 'react'
import { Backdrop } from '../feedback/Backdrop'

export interface AnchorOrigin {
  vertical: 'top' | 'center' | 'bottom'
  horizontal: 'left' | 'center' | 'right'
}

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  open?: boolean
  anchorEl?: HTMLElement | null
  onClose?: () => void
  anchorOrigin?: AnchorOrigin
  transformOrigin?: AnchorOrigin
  /** Test ID for automated testing */
  testId?: string
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  open,
  anchorEl,
  onClose,
  anchorOrigin,
  transformOrigin,
  className = '',
  testId,
  ...props
}) =>
  open ? (
    <>
      <Backdrop open onClick={onClose} className="backdrop--transparent" />
      <div className={`popover ${className}`} role="dialog" data-testid={testId} {...props}>
        {children}
      </div>
    </>
  ) : null
