'use client'

import { forwardRef, ReactNode, useState } from 'react'

import {
  Accordion as FakeMuiAccordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@/fakemui'
import { ExpandMore } from '@/fakemui/icons'

interface AccordionProps {
  children: ReactNode
  type?: 'single' | 'multiple'
  collapsible?: boolean
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  className?: string
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, type = 'single', ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  }
)
Accordion.displayName = 'Accordion'

interface AccordionItemProps {
  children: ReactNode
  value: string
  disabled?: boolean
  className?: string
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, value, disabled, className, ...props }, ref) => {
    const [expanded, setExpanded] = useState(false)

    return (
      <FakeMuiAccordion
        ref={ref}
        expanded={expanded}
        disabled={disabled}
        className={`accordion-item ${expanded ? 'accordion-item--expanded' : ''} ${className || ''}`}
        {...props}
      >
        <div onClick={() => !disabled && setExpanded(!expanded)}>{children}</div>
      </FakeMuiAccordion>
    )
  }
)
AccordionItem.displayName = 'AccordionItem'

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
        className={className}
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

interface AccordionContentProps {
  children: ReactNode
  className?: string
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <AccordionDetails ref={ref} className={className} {...props}>
        {children}
      </AccordionDetails>
    )
  }
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
