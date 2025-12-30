'use client'

import { forwardRef, ReactNode } from 'react'

import { FormLabel, FormLabelProps } from '@/fakemui/fakemui/inputs'

import styles from './Label.module.scss'

/**
 * Props for the Label component
 * @extends {FormLabelProps} Inherits fakemui FormLabel props
 */
export interface LabelProps extends FormLabelProps {
  /** ID of the form element this label is associated with */
  htmlFor?: string
  /** Content to display inside the label */
  children?: ReactNode
  /** Whether the label is disabled */
  disabled?: boolean
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(({ children, disabled, className, ...props }, ref) => {
  return (
    <FormLabel
      ref={ref}
      className={`${styles.label} ${disabled ? styles.disabled : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </FormLabel>
  )
})

Label.displayName = 'Label'

export { Label }
