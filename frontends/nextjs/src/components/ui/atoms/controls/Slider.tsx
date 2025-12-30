'use client'

import { CSSProperties,forwardRef } from 'react'

import { Slider as FakemuiSlider, SliderProps as FakemuiSliderProps } from '@/fakemui/fakemui/inputs'

import styles from './Slider.module.scss'

/**
 * Props for the Slider component
 * @extends {FakemuiSliderProps} Inherits fakemui Slider props
 */
export interface SliderProps extends FakemuiSliderProps {
  /** Custom inline styles */
  style?: CSSProperties
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(({ className, style, ...props }, ref) => {
  return (
    <FakemuiSlider
      ref={ref}
      className={`${styles.slider} ${className || ''}`}
      style={style}
      {...props}
    />
  )
})

Slider.displayName = 'Slider'

export { Slider }
