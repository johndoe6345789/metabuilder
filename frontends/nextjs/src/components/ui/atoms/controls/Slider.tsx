'use client'

import { Slider as MuiSlider, SliderProps as MuiSliderProps } from '@mui/material'
import { forwardRef } from 'react'

/**
 * Props for the Slider component
 * @extends {MuiSliderProps} Inherits Material-UI Slider props
 */
export type SliderProps = MuiSliderProps

const Slider = forwardRef<HTMLSpanElement, SliderProps>(({ sx, ...props }, ref) => {
  return (
    <MuiSlider
      ref={ref}
      sx={{
        '& .MuiSlider-thumb': {
          width: 16,
          height: 16,
        },
        '& .MuiSlider-track': {
          height: 4,
        },
        '& .MuiSlider-rail': {
          height: 4,
        },
        ...sx,
      }}
      {...props}
    />
  )
})

Slider.displayName = 'Slider'

export { Slider }
