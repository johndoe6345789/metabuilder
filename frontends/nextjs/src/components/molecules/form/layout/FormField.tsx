'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { Input } from '../atoms/Input'
import { Label } from '../atoms/Label'

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
  ({ label, name, error, required, helperText, children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }} {...props}>
        {label && (
          <Label htmlFor={name} required={required} error={!!error}>
            {label}
          </Label>
        )}
        {children}
        {(error || helperText) && (
          <Box
            component="span"
            sx={{
              fontSize: '0.75rem',
              color: error ? 'error.main' : 'text.secondary',
            }}
          >
            {error || helperText}
          </Box>
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
  ({ value, onChange, placeholder = 'Search...', fullWidth = true, ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        fullWidth={fullWidth}
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
          },
        }}
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
  ({ error, fullWidth = true, style, ...props }, ref) => {
    return (
      <Box
        component="textarea"
        ref={ref}
        sx={{
          width: fullWidth ? '100%' : 'auto',
          minHeight: 80,
          px: 1.5,
          py: 1,
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          border: 1,
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          resize: 'vertical',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:hover': {
            borderColor: error ? 'error.main' : 'text.secondary',
          },
          '&:focus': {
            outline: 'none',
            borderColor: error ? 'error.main' : 'primary.main',
            boxShadow: (theme) =>
              `0 0 0 2px ${error ? theme.palette.error.main : theme.palette.primary.main}25`,
          },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
        {...props}
      />
    )
  }
)
TextArea.displayName = 'TextArea'

export { FormField, SearchInput, TextArea }
