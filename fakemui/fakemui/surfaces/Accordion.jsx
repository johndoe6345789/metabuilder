import React, { forwardRef } from 'react'

export const Accordion = ({ children, expanded, disabled, className = '', ...props }) => (
  <div className={`accordion ${expanded ? 'accordion--expanded' : ''} ${disabled ? 'accordion--disabled' : ''} ${className}`} {...props}>{children}</div>
)

export const AccordionSummary = forwardRef(({ children, expandIcon, className = '', ...props }, ref) => (
  <button ref={ref} className={`accordion-header ${className}`} {...props}>
    {children}
    {expandIcon && <span className="accordion-expand-icon">{expandIcon}</span>}
  </button>
))

export const AccordionDetails = ({ children, className = '', ...props }) => (
  <div className={`accordion-content ${className}`} {...props}>{children}</div>
)

export const AccordionActions = ({ children, className = '', ...props }) => (
  <div className={`accordion-actions ${className}`} {...props}>{children}</div>
)
