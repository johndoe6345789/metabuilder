import React from 'react'
import classNames from 'classnames'

export interface InputAdornmentProps {
  position?: 'start' | 'end'
  children?: React.ReactNode
  className?: string
}

export function InputAdornment({ position = 'start', children, className }: InputAdornmentProps) {
  return (
    <span
      className={classNames('fakemui-input-adornment', `fakemui-input-adornment--${position}`, className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      {children}
    </span>
  )
}

export default InputAdornment
