'use client'

import { forwardRef, ReactNode, useState } from 'react'
import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

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
  ({ children, value, disabled, ...props }, ref) => {
    const [expanded, setExpanded] = useState(false)

    return (
      <MuiAccordion
        ref={ref}
        expanded={expanded}
        onChange={(_, isExpanded) => setExpanded(isExpanded)}
        disabled={disabled}
        disableGutters
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          '&:not(:last-child)': {
            borderBottom: 0,
          },
          '&:first-of-type': {
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
          '&:last-of-type': {
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          },
          '&::before': {
            display: 'none',
          },
        }}
        {...props}
      >
        {children}
      </MuiAccordion>
    )
  }
)
AccordionItem.displayName = 'AccordionItem'

interface AccordionTriggerProps {
  children: ReactNode
  className?: string
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, ...props }, ref) => {
    return (
      <AccordionSummary
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '& .MuiAccordionSummary-content': {
            my: 1.5,
          },
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        {...props}
      >
        <Typography fontWeight={500}>{children}</Typography>
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
  ({ children, ...props }, ref) => {
    return (
      <AccordionDetails ref={ref} sx={{ pt: 0, pb: 2 }} {...props}>
        {children}
      </AccordionDetails>
    )
  }
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
