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
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  open,
  anchorEl,
  onClose,
  anchorOrigin,
  transformOrigin,
  className = '',
  ...props
}) =>
  open ? (
    <>
      <Backdrop open onClick={onClose} className="backdrop--transparent" />
      <div className={`popover ${className}`} {...props}>
        {children}
      </div>
    </>
  ) : null
