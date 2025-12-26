'use client'

import { forwardRef, ReactNode } from 'react'
import { 
  Card as MuiCard, 
  CardProps as MuiCardProps,
  CardHeader as MuiCardHeader,
  CardHeaderProps as MuiCardHeaderProps,
  CardContent as MuiCardContent,
  CardContentProps as MuiCardContentProps,
  CardActions as MuiCardActions,
  CardActionsProps as MuiCardActionsProps,
  Typography,
  Box,
} from '@mui/material'

// Card
export interface CardProps extends MuiCardProps {
  noPadding?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ noPadding, sx, ...props }, ref) => {
    return (
      <MuiCard
        ref={ref}
        sx={{
          borderRadius: 2,
          ...(noPadding && { '& .MuiCardContent-root': { p: 0 } }),
          ...sx,
        }}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

// CardHeader
export interface CardHeaderProps extends MuiCardHeaderProps {
  description?: ReactNode
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ description, subheader, ...props }, ref) => {
    return (
      <MuiCardHeader
        ref={ref}
        subheader={description || subheader}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
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

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="h6" fontWeight={600} {...props}>
        {children}
      </Typography>
    )
  }
)
CardTitle.displayName = 'CardTitle'

// CardDescription
interface CardDescriptionProps {
  children: ReactNode
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

// CardContent
const CardContent = forwardRef<HTMLDivElement, MuiCardContentProps>(
  (props, ref) => {
    return <MuiCardContent ref={ref} {...props} />
  }
)
CardContent.displayName = 'CardContent'

// CardFooter / CardActions
const CardFooter = forwardRef<HTMLDivElement, MuiCardActionsProps>(
  ({ sx, ...props }, ref) => {
    return (
      <MuiCardActions
        ref={ref}
        sx={{ px: 2, pb: 2, justifyContent: 'flex-end', ...sx }}
        {...props}
      />
    )
  }
)
CardFooter.displayName = 'CardFooter'

// CardAction (for header actions - shadcn compat)
const CardAction = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        {children}
      </Box>
    )
  }
)
CardAction.displayName = 'CardAction'

export { 
  Card, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardContent, 
  CardFooter,
  CardAction,
}
