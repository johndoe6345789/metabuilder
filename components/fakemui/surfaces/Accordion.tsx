import React, { forwardRef } from 'react'

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  expanded?: boolean
  disabled?: boolean
}

export const Accordion: React.FC<AccordionProps> = ({ children, expanded, disabled, className = '', ...props }) => (
  <div
    className={`accordion ${expanded ? 'accordion--expanded' : ''} ${disabled ? 'accordion--disabled' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)

export interface AccordionSummaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  expandIcon?: React.ReactNode
}

export const AccordionSummary = forwardRef<HTMLButtonElement, AccordionSummaryProps>(
  ({ children, expandIcon, className = '', ...props }, ref) => (
    <button ref={ref} className={`accordion-header ${className}`} {...props}>
      {children}
      {expandIcon && <span className="accordion-expand-icon">{expandIcon}</span>}
    </button>
  )
)

AccordionSummary.displayName = 'AccordionSummary'

export interface AccordionDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const AccordionDetails: React.FC<AccordionDetailsProps> = ({ children, className = '', ...props }) => (
  <div className={`accordion-content ${className}`} {...props}>
    {children}
  </div>
)

export interface AccordionActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const AccordionActions: React.FC<AccordionActionsProps> = ({ children, className = '', ...props }) => (
  <div className={`accordion-actions ${className}`} {...props}>
    {children}
  </div>
)
