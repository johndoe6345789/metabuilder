'use client'

import { FormControl, FormLabel, Select, MenuItem, Box } from '@/fakemui'

export interface ItemsPerPageSelectorProps {
  value: number
  onChange: (value: number) => void
  options?: number[]
  disabled?: boolean
  label?: string
}

const DEFAULT_OPTIONS = [10, 20, 50, 100]

/**
 * Material-UI based items-per-page selector
 * 
 * Allows users to select how many items to display per page
 * following MetaBuilder's design system using Material-UI components
 */
export function ItemsPerPageSelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  disabled = false,
  label = 'Items per page',
}: ItemsPerPageSelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(event.target.value))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <FormControl disabled={disabled} sx={{ minWidth: 120 }}>
        <FormLabel htmlFor="items-per-page-select">{label}</FormLabel>
        <Select
          id="items-per-page-select"
          value={String(value)}
          onChange={handleChange as never}
          disabled={disabled}
          sx={{
            fontFamily: 'IBM Plex Sans, sans-serif',
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
