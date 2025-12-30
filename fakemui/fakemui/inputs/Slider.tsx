import React, { forwardRef } from 'react'

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} type="range" className={`slider ${className}`} {...props} />
  )
)

Slider.displayName = 'Slider'
