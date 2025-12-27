'use client'

import { forwardRef } from 'react'
import { TextareaAutosize, TextareaAutosizeProps, Box } from '@mui/material'

export interface TextAreaProps extends Omit<TextareaAutosizeProps, 'ref'> {
  error?: boolean
  fullWidth?: boolean
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, fullWidth = true, minRows = 3, ...props }, ref) => {
    return (
      <Box
        sx={{
          width: fullWidth ? '100%' : 'auto',
        }}
      >
        <TextareaAutosize
          ref={ref}
          minRows={minRows}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            border: `1px solid ${error ? 'var(--mui-palette-error-main)' : 'var(--mui-palette-divider)'}`,
            borderRadius: '4px',
            backgroundColor: 'var(--mui-palette-background-paper)',
            color: 'var(--mui-palette-text-primary)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            resize: 'vertical',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error 
              ? 'var(--mui-palette-error-main)' 
              : 'var(--mui-palette-primary-main)'
            e.currentTarget.style.boxShadow = `0 0 0 2px ${
              error 
                ? 'rgba(var(--mui-palette-error-mainChannel) / 0.15)' 
                : 'rgba(var(--mui-palette-primary-mainChannel) / 0.15)'
            }`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error 
              ? 'var(--mui-palette-error-main)' 
              : 'var(--mui-palette-divider)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...props}
        />
      </Box>
    )
  }
)

TextArea.displayName = 'TextArea'

export { TextArea }
