import React from 'react'

export interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  in?: boolean
}

export const Collapse: React.FC<CollapseProps> = ({ children, in: isIn, className = '', ...props }) => (
  <div className={`collapse ${isIn ? 'collapse--in' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface FadeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  in?: boolean
}

export const Fade: React.FC<FadeProps> = ({ children, in: isIn, className = '', ...props }) => (
  <div className={`fade ${isIn ? 'fade--in' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface GrowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  in?: boolean
}

export const Grow: React.FC<GrowProps> = ({ children, in: isIn, className = '', ...props }) => (
  <div className={`grow ${isIn ? 'grow--in' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface SlideProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  in?: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
}

export const Slide: React.FC<SlideProps> = ({ children, in: isIn, direction = 'down', className = '', ...props }) => (
  <div className={`slide slide--${direction} ${isIn ? 'slide--in' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface ZoomProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  in?: boolean
}

export const Zoom: React.FC<ZoomProps> = ({ children, in: isIn, className = '', ...props }) => (
  <div className={`zoom ${isIn ? 'zoom--in' : ''} ${className}`} {...props}>
    {children}
  </div>
)
