'use client'

import { Box } from '@/fakemui/fakemui/layout'
import { Typography } from '@/fakemui/fakemui/data-display'
import { forwardRef, ReactNode } from 'react'

import styles from './Header.module.scss'

interface SheetHeaderProps {
  children: ReactNode
  className?: string
}

const SheetHeader = forwardRef<HTMLDivElement, SheetHeaderProps>(({ children, className, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      className={`${styles.header} ${className || ''}`}
      {...props}
    >
      {children}
    </Box>
  )
})
SheetHeader.displayName = 'SheetHeader'

interface SheetFooterProps {
  children: ReactNode
  className?: string
}

const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(({ children, className, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      className={`${styles.footer} ${className || ''}`}
      {...props}
    >
      {children}
    </Box>
  )
})
SheetFooter.displayName = 'SheetFooter'

interface SheetTitleProps {
  children: ReactNode
  className?: string
}

const SheetTitle = forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Typography
        variant="h6"
        as="h2"
        className={`${styles.title} ${className || ''}`}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)
SheetTitle.displayName = 'SheetTitle'

interface SheetDescriptionProps {
  children: ReactNode
  className?: string
}

const SheetDescription = forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Typography variant="body2" className={`${styles.description} ${className || ''}`} {...props}>
        {children}
      </Typography>
    )
  }
)
SheetDescription.displayName = 'SheetDescription'

export { SheetDescription, SheetFooter, SheetHeader, SheetTitle }
