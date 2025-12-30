'use client'

import { forwardRef, ReactNode } from 'react'

import {
  Accordion as FakeMuiAccordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@/fakemui'
import { ExpandMore } from '@/fakemui/icons'

// Accordion (single item)
export interface AccordionProps {
  children: ReactNode
  expanded?: boolean
  disabled?: boolean
  type?: 'single' | 'multiple'
  collapsible?: boolean
  value?: string
  className?: string
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, type = 'single', collapsible, expanded, disabled, className, ...props }, ref) => {
    return (
      <FakeMuiAccordion
        ref={ref}
        expanded={expanded}
        disabled={disabled}
        className={`accordion ${className || ''}`}
        {...props}
      >
        {children}
      </FakeMuiAccordion>
    )
  }
)
Accordion.displayName = 'Accordion'

// AccordionItem (for shadcn compat - wraps Accordion)
interface AccordionItemProps {
  children: ReactNode
  value: string
  className?: string
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, value, className, ...props }, ref) => {
    return (
      <Accordion ref={ref} className={className} {...props}>
        {children}
      </Accordion>
    )
  }
)
AccordionItem.displayName = 'AccordionItem'

// AccordionTrigger
interface AccordionTriggerProps {
  children: ReactNode
  className?: string
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <AccordionSummary
        ref={ref}
        expandIcon={<ExpandMore />}
        className={`accordion-trigger ${className || ''}`}
        {...props}
      >
        <Typography variant="body1" className="font-medium">
          {children}
        </Typography>
      </AccordionSummary>
    )
  }
)
AccordionTrigger.displayName = 'AccordionTrigger'

// AccordionContent
interface AccordionContentProps {
  children: ReactNode
  className?: string
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <AccordionDetails ref={ref} className={`accordion-content ${className || ''}`} {...props}>
        {children}
      </AccordionDetails>
    )
  }
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
