'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, IconButton, TextField } from '@/fakemui'
import { Clear, FilterList, Search } from '@/fakemui/icons'

import styles from './SearchBar.module.scss'

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
      className,
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
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        fullWidth={fullWidth}
        disabled={disabled}
        className={`${styles.searchBar} ${className || ''}`}
        startAdornment={
          <Search size={16} className={styles.searchIcon} />
        }
        endAdornment={
          <Box className={styles.endAdornments}>
            {showClearButton && value && !disabled && (
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                sm
                className={styles.clearButton}
              >
                <Clear size={16} />
              </IconButton>
            )}
            {showFilterButton && (
              <IconButton
                aria-label="open filters"
                onClick={onFilterClick}
                disabled={disabled}
                sm
                className={styles.filterButton}
              >
                <FilterList size={16} />
              </IconButton>
            )}
            {endAdornment}
          </Box>
        }
        {...props}
      />
    )
  }
)

SearchBar.displayName = 'SearchBar'

export { SearchBar }
