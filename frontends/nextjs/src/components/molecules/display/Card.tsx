'use client'

import { forwardRef, ReactNode } from 'react'

import {
  Box,
  Card as FakeMuiCard,
  CardActions,
  CardContent as FakeMuiCardContent,
  CardHeader as FakeMuiCardHeader,
  Typography,
} from '@/fakemui'

// Card
export interface CardProps {
  children?: ReactNode
  noPadding?: boolean
  className?: string
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ noPadding, className, ...props }, ref) => {
  return (
    <FakeMuiCard
      ref={ref}
      className={`card ${noPadding ? 'card--no-padding' : ''} ${className || ''}`}
      {...props}
    />
  )
})
Card.displayName = 'Card'

// CardHeader
export interface CardHeaderProps {
  title?: ReactNode
  subheader?: ReactNode
  action?: ReactNode
  avatar?: ReactNode
  description?: ReactNode
  className?: string
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ description, subheader, ...props }, ref) => {
    return (
      <FakeMuiCardHeader
        ref={ref}
        subheader={description || subheader}
        {...props}
      />
    )
  }
)
CardHeader.displayName = 'CardHeader'

// CardTitle (for shadcn compatibility)
interface CardTitleProps {
  children: ReactNode
  className?: string
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({ children, className, ...props }, ref) => {
  return (
    <Typography ref={ref} variant="h6" className={`card-title ${className || ''}`} {...props}>
      {children}
    </Typography>
  )
})
CardTitle.displayName = 'CardTitle'

// CardDescription
interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="body2" className={`card-description ${className || ''}`} {...props}>
        {children}
      </Typography>
    )
  }
)
CardDescription.displayName = 'CardDescription'

// CardContent
const CardContent = forwardRef<HTMLDivElement, { children?: ReactNode; className?: string }>(
  ({ className, ...props }, ref) => {
    return <FakeMuiCardContent ref={ref} className={`card-content ${className || ''}`} {...props} />
  }
)
CardContent.displayName = 'CardContent'

// CardFooter / CardActions
const CardFooter = forwardRef<HTMLDivElement, { children?: ReactNode; className?: string }>(
  ({ className, ...props }, ref) => {
    return (
      <CardActions ref={ref} className={`card-footer ${className || ''}`} {...props} />
    )
  }
)
CardFooter.displayName = 'CardFooter'

// CardAction (for header actions - shadcn compat)
const CardAction = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`card-action ${className || ''}`} {...props}>
        {children}
      </Box>
    )
  }
)
CardAction.displayName = 'CardAction'

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
