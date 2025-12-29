'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Accordion as MuiAccordion,
  AccordionProps as MuiAccordionProps,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Accordion (single item)
export interface AccordionProps extends Omit<MuiAccordionProps, 'children'> {
  children: ReactNode
  type?: 'single' | 'multiple'
  collapsible?: boolean
  value?: string
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, type = 'single', collapsible, sx, ...props }, ref) => {
    return (
      <MuiAccordion
        ref={ref}
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
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiAccordion>
    )
  }
)
Accordion.displayName = 'Accordion'

// AccordionItem (for shadcn compat - wraps MuiAccordion)
interface AccordionItemProps {
  children: ReactNode
  value: string
  className?: string
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, value, ...props }, ref) => {
    return (
      <Accordion ref={ref} {...props}>
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

const AccordionTrigger = forwardRef<HTMLDivElement, AccordionTriggerProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiAccordionSummary
        ref={ref}
        expandIcon={<ExpandMoreIcon />}
        sx={{
          flexDirection: 'row',
          '& .MuiAccordionSummary-content': {
            fontWeight: 500,
          },
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        {...props}
      >
        <Typography fontWeight={500}>{children}</Typography>
      </MuiAccordionSummary>
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
  ({ children, ...props }, ref) => {
    return (
      <MuiAccordionDetails ref={ref} sx={{ pt: 0, pb: 2 }} {...props}>
        {children}
      </MuiAccordionDetails>
    )
  }
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
