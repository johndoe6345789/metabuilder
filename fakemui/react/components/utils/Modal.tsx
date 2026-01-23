import React from 'react'
import { Backdrop } from '../feedback/Backdrop'

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  open?: boolean
  onClose?: () => void
}

export const Modal: React.FC<ModalProps> = ({ children, open, onClose, className = '', ...props }) =>
  open ? (
    <div className={`modal ${className}`} {...props}>
      <Backdrop open onClick={onClose} />
      <div className="modal-content">{children}</div>
    </div>
  ) : null

export const Dialog = Modal // alias
