'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, TextField } from '@/fakemui'
import { Search } from '@/fakemui/icons'

import { Label } from '../atoms/Label'

import styles from './FormField.module.scss'

// FormField - combines label and input
export interface FormFieldProps {
  label?: string
  name?: string
  error?: string
  required?: boolean
  helperText?: string
  children: ReactNode
  className?: string
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, name, error, required, helperText, children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.formField} ${className || ''}`} {...props}>
        {label && (
          <Label htmlFor={name} required={required} error={!!error}>
            {label}
          </Label>
        )}
        {children}
        {(error || helperText) && (
          <span className={`${styles.helperText} ${error ? styles.error : ''}`}>
            {error || helperText}
          </span>
        )}
      </Box>
    )
  }
)
FormField.displayName = 'FormField'

// SearchInput - input with search icon
export interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  fullWidth?: boolean
  className?: string
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = 'Search...', fullWidth = true, className, ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        fullWidth={fullWidth}
        className={`${styles.searchInput} ${className || ''}`}
        startAdornment={<Search size={16} className={styles.searchIcon} />}
        {...props}
      />
    )
  }
)
SearchInput.displayName = 'SearchInput'

// TextArea
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  fullWidth?: boolean
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, fullWidth = true, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`${styles.textarea} ${error ? styles.error : ''} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`}
        {...props}
      />
    )
  }
)
TextArea.displayName = 'TextArea'

export { FormField, SearchInput, TextArea }
