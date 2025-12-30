import React from 'react'

export const Collapse = ({ children, in: isIn, className = '', ...props }) => (
  <div className={`collapse ${isIn ? 'collapse--in' : ''} ${className}`} {...props}>{children}</div>
)

export const Fade = ({ children, in: isIn, className = '', ...props }) => (
  <div className={`fade ${isIn ? 'fade--in' : ''} ${className}`} {...props}>{children}</div>
)

export const Grow = ({ children, in: isIn, className = '', ...props }) => (
  <div className={`grow ${isIn ? 'grow--in' : ''} ${className}`} {...props}>{children}</div>
)

export const Slide = ({ children, in: isIn, direction = 'down', className = '', ...props }) => (
  <div className={`slide slide--${direction} ${isIn ? 'slide--in' : ''} ${className}`} {...props}>{children}</div>
)

export const Zoom = ({ children, in: isIn, className = '', ...props }) => (
  <div className={`zoom ${isIn ? 'zoom--in' : ''} ${className}`} {...props}>{children}</div>
)
