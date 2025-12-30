import React from 'react'
import { Backdrop } from '../feedback/Backdrop'

export const Modal = ({ children, open, onClose, className = '', ...props }) => (
  open ? (
    <div className={`modal ${className}`} {...props}>
      <Backdrop open onClick={onClose} />
      <div className="modal-content">{children}</div>
    </div>
  ) : null
)

export const Dialog = Modal // alias
