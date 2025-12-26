'use client'

import { forwardRef, ReactNode } from 'react'
import { Card as MuiCard, CardContent, CardHeader, CardActions, CardMedia, Typography, Box } from '@mui/material'
import type { CardProps as MuiCardProps } from '@mui/material'

export interface CardProps extends MuiCardProps {
  children?: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, sx, ...props }, ref) => {
    return (
      <MuiCard
        ref={ref}
        sx={{
          borderRadius: 2,
          boxShadow: 1,
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiCard>
    )
  }
)
Card.displayName = 'Card'

interface CardHeaderProps {
  children?: ReactNode
  className?: string
}

const CardHeaderComponent = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ p: 3, pb: 0 }} {...props}>
        {children}
      </Box>
    )
  }
)
CardHeaderComponent.displayName = 'CardHeader'

interface CardTitleProps {
  children?: ReactNode
  className?: string
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="h6" component="h3" fontWeight={600} {...props}>
        {children}
      </Typography>
    )
  }
)
CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps {
  children?: ReactNode
  className?: string
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="body2" color="text.secondary" {...props}>
        {children}
      </Typography>
    )
  }
)
CardDescription.displayName = 'CardDescription'

interface CardContentProps {
  children?: ReactNode
  className?: string
}

const CardContentComponent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <CardContent ref={ref} sx={{ p: 3 }} {...props}>
        {children}
      </CardContent>
    )
  }
)
CardContentComponent.displayName = 'CardContent'

interface CardFooterProps {
  children?: ReactNode
  className?: string
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <CardActions ref={ref} sx={{ p: 3, pt: 0 }} {...props}>
        {children}
      </CardActions>
    )
  }
)
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeaderComponent as CardHeader,
  CardTitle,
  CardDescription,
  CardContentComponent as CardContent,
  CardFooter,
}
