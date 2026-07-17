'use client'

import { FormControl, FormLabel, Select } from '@/m3'
import s from './Pagination.module.scss'

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
    <div className={s.pageSize}>
      <FormControl disabled={disabled} className={s.pageSizeControl}>
        <FormLabel htmlFor="items-per-page-select">{label}</FormLabel>
        <Select
          native
          value={String(value)}
          onChange={handleChange as never}
          disabled={disabled}
          inputProps={{ id: 'items-per-page-select' }}
          className={s.pageSizeSelect}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
