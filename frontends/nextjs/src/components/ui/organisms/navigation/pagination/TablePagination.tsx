'use client'

import FirstPageIcon from '@mui/icons-material/FirstPage'
import LastPageIcon from '@mui/icons-material/LastPage'
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { forwardRef } from 'react'

import { NextIcon, PreviousIcon } from './paginationUtils'

interface TablePaginationProps {
  count: number
  page: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  showFirstLastButtons?: boolean
  disabled?: boolean
}

const TablePagination = forwardRef<HTMLDivElement, TablePaginationProps>(
  (
    {
      count,
      page,
      pageSize,
      pageSizeOptions = [10, 25, 50, 100],
      onPageChange,
      onPageSizeChange,
      showFirstLastButtons = true,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const totalPages = Math.ceil(count / pageSize)
    const startItem = (page - 1) * pageSize + 1
    const endItem = Math.min(page * pageSize, count)

    const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
      onPageSizeChange(Number(event.target.value))
    }

    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          py: 1,
        }}
        {...props}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <FormControl size="small" disabled={disabled}>
            <Select value={pageSize} onChange={handlePageSizeChange} sx={{ minWidth: 70 }}>
              {pageSizeOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {count === 0 ? '0' : `${startItem}-${endItem}`} of {count}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showFirstLastButtons && (
            <IconButton
              onClick={() => onPageChange(1)}
              disabled={disabled || page === 1}
              size="small"
              aria-label="Go to first page"
            >
              <FirstPageIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || page === 1}
            size="small"
            aria-label="Go to previous page"
          >
            <PreviousIcon />
          </IconButton>
          <IconButton
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page === totalPages}
            size="small"
            aria-label="Go to next page"
          >
            <NextIcon />
          </IconButton>
          {showFirstLastButtons && (
            <IconButton
              onClick={() => onPageChange(totalPages)}
              disabled={disabled || page === totalPages}
              size="small"
              aria-label="Go to last page"
            >
              <LastPageIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    )
  }
)
TablePagination.displayName = 'TablePagination'

export { TablePagination }
export type { TablePaginationProps }
