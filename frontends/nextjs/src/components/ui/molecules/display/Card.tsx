'use client'

import {
  Card as FakeMuiCard,
  CardContent as FakeMuiCardContent,
  CardActions,
  CardTitle as FakeMuiCardTitle,
  CardDescription as FakeMuiCardDescription,
  CardFooter as FakeMuiCardFooter,
} from '@fakemui/fakemui/surfaces'
import { Box } from '@fakemui/fakemui/layout'
import { forwardRef, ReactNode } from 'react'
import styles from './Card.module.scss'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  raised?: boolean
  clickable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', raised, clickable, ...props }, ref) => {
    return (
      <FakeMuiCard
        ref={ref}
        raised={raised}
        clickable={clickable}
        className={`${styles.card} ${className}`}
        {...props}
      >
        {children}
      </FakeMuiCard>
    )
  }
)
Card.displayName = 'Card'

interface CardHeaderProps {
  children?: ReactNode
  className?: string
}

const CardHeaderComponent = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.cardHeader} ${className}`} {...props}>
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
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiCardTitle ref={ref} className={`${styles.cardTitle} ${className}`} {...props}>
        {children}
      </FakeMuiCardTitle>
    )
  }
)
CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps {
  children?: ReactNode
  className?: string
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiCardDescription ref={ref} className={`${styles.cardDescription} ${className}`} {...props}>
        {children}
      </FakeMuiCardDescription>
    )
  }
)
CardDescription.displayName = 'CardDescription'

interface CardContentProps {
  children?: ReactNode
  className?: string
}

const CardContentComponent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiCardContent ref={ref} className={`${styles.cardContent} ${className}`} {...props}>
        {children}
      </FakeMuiCardContent>
    )
  }
)
CardContentComponent.displayName = 'CardContent'

interface CardFooterProps {
  children?: ReactNode
  className?: string
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiCardFooter ref={ref} className={`${styles.cardFooter} ${className}`} {...props}>
        {children}
      </FakeMuiCardFooter>
    )
  }
)
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardContentComponent as CardContent,
  CardDescription,
  CardFooter,
  CardHeaderComponent as CardHeader,
  CardTitle,
}
