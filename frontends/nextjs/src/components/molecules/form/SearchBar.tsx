'use client'

import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

import { Clear, FilterList, Search } from '@/fakemui/icons'

export interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  onFilterClick?: () => void
  placeholder?: string
  fullWidth?: boolean
  showFilterButton?: boolean
  showClearButton?: boolean
  disabled?: boolean
  loading?: boolean
  endAdornment?: ReactNode
  className?: string
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value = '',
      onChange,
      onClear,
      onFilterClick,
      placeholder = 'Search...',
      fullWidth = true,
      showFilterButton = false,
      showClearButton = true,
      disabled = false,
      loading = false,
      endAdornment,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    const handleClear = () => {
      onChange?.('')
      onClear?.()
    }

    return (
      <TextField
        inputRef={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        fullWidth={fullWidth}
        disabled={disabled}
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} style={{ color: 'rgba(0,0,0,0.54)' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {showClearButton && value && !disabled && (
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClear}
                      edge="end"
                      size="small"
                      sx={{ p: 0.5 }}
                    >
                      <Clear size={16} />
                    </IconButton>
                  )}
                  {showFilterButton && (
                    <IconButton
                      aria-label="open filters"
                      onClick={onFilterClick}
                      edge="end"
                      size="small"
                      disabled={disabled}
                      sx={{ p: 0.5 }}
                    >
                      <FilterList size={16} />
                    </IconButton>
                  )}
                  {endAdornment}
                </Box>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'background.paper',
            transition: 'box-shadow 0.2s',
            '&:hover': {
              boxShadow: 1,
            },
            '&.Mui-focused': {
              boxShadow: 2,
            },
          },
        }}
        {...props}
      />
    )
  }
)

SearchBar.displayName = 'SearchBar'

export { SearchBar }
