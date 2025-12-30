import React from 'react'

export const Flex = ({ children, col, row, center, between, around, evenly, start, end, wrap, inline, gap, className = '', ...props }) => (
  <div className={`${inline ? 'inline-flex' : 'flex'} ${col ? 'flex-col' : ''} ${row ? 'flex-row' : ''} ${center ? 'flex-center' : ''} ${between ? 'flex-between' : ''} ${around ? 'justify-around' : ''} ${evenly ? 'justify-evenly' : ''} ${start ? 'items-start' : ''} ${end ? 'items-end' : ''} ${wrap ? 'flex-wrap' : ''} ${gap ? `gap-${gap}` : ''} ${className}`} {...props}>{children}</div>
)
