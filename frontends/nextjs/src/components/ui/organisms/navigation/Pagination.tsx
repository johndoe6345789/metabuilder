// TODO: Split this file (405 LOC) into smaller organisms (<150 LOC each)
'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Pagination as MuiPagination,
  PaginationItem,
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import LastPageIcon from '@mui/icons-material/LastPage'

// Pagination Root
interface PaginationProps {
  count: number
  page: number
  onChange: (page: number) => void
  siblingCount?: number
  boundaryCount?: number
  showFirstButton?: boolean
  showLastButton?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'text' | 'outlined'
  shape?: 'circular' | 'rounded'
  color?: 'primary' | 'secondary' | 'standard'
}

const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({
    count,
    page,
    onChange,
    siblingCount = 1,
    boundaryCount = 1,
    showFirstButton = false,
    showLastButton = false,
    disabled = false,
    size = 'medium',
    variant = 'outlined',
    shape = 'rounded',
    color = 'primary',
    ...props
  }, ref) => {
    return (
      <MuiPagination
        ref={ref}
        count={count}
        page={page}
        onChange={(_, newPage) => onChange(newPage)}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
        disabled={disabled}
        size={size}
        variant={variant}
        shape={shape}
        color={color}
        {...props}
      />
    )
  }
)
Pagination.displayName = 'Pagination'

// Simplified Pagination (Previous/Next only)
interface SimplePaginationProps {
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  previousLabel?: string
  nextLabel?: string
  disabled?: boolean
}

const SimplePagination = forwardRef<HTMLDivElement, SimplePaginationProps>(
  ({
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
    previousLabel = 'Previous',
    nextLabel = 'Next',
    disabled = false,
    ...props
  }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
        {...props}
      >
        <IconButton
          onClick={onPrevious}
          disabled={disabled || !hasPrevious}
          size="small"
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            px: 2,
            py: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ChevronLeftIcon fontSize="small" />
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {previousLabel}
          </Typography>
        </IconButton>
        <IconButton
          onClick={onNext}
          disabled={disabled || !hasNext}
          size="small"
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            px: 2,
            py: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Typography variant="body2" sx={{ mr: 0.5 }}>
            {nextLabel}
          </Typography>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    )
  }
)
SimplePagination.displayName = 'SimplePagination'

// Table Pagination (with page size selector)
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
  ({
    count,
    page,
    pageSize,
    pageSizeOptions = [10, 25, 50, 100],
    onPageChange,
    onPageSizeChange,
    showFirstLastButtons = true,
    disabled = false,
    ...props
  }, ref) => {
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
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              sx={{ minWidth: 70 }}
            >
              {pageSizeOptions.map((option) => (
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
            >
              <FirstPageIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || page === 1}
            size="small"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page === totalPages}
            size="small"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          {showFirstLastButtons && (
            <IconButton
              onClick={() => onPageChange(totalPages)}
              disabled={disabled || page === totalPages}
              size="small"
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

// PaginationContent - wrapper for custom pagination content
interface PaginationContentProps {
  children: ReactNode
}

const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="ul"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          listStyle: 'none',
          p: 0,
          m: 0,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
PaginationContent.displayName = 'PaginationContent'

// PaginationItem wrapper
interface PaginationItemWrapperProps {
  children: ReactNode
}

const PaginationItemWrapper = forwardRef<HTMLLIElement, PaginationItemWrapperProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box component="li" ref={ref} {...props}>
        {children}
      </Box>
    )
  }
)
PaginationItemWrapper.displayName = 'PaginationItem'

// PaginationLink
interface PaginationLinkProps {
  children: ReactNode
  onClick?: () => void
  isActive?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const PaginationLink = forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ children, onClick, isActive = false, disabled = false, size = 'medium', ...props }, ref) => {
    const sizeMap = {
      small: { minWidth: 28, height: 28 },
      medium: { minWidth: 36, height: 36 },
      large: { minWidth: 44, height: 44 },
    }

    return (
      <IconButton
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        sx={{
          ...sizeMap[size],
          borderRadius: 1,
          bgcolor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: isActive ? 'primary.dark' : 'action.hover',
          },
          '&.Mui-disabled': {
            opacity: 0.5,
          },
        }}
        {...props}
      >
        {children}
      </IconButton>
    )
  }
)
PaginationLink.displayName = 'PaginationLink'

// Pagination Ellipsis
const PaginationEllipsis = forwardRef<HTMLSpanElement, Record<string, never>>(
  (props, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          color: 'text.secondary',
        }}
        {...props}
      >
        ...
      </Box>
    )
  }
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

// Previous/Next buttons
const PaginationPrevious = forwardRef<HTMLButtonElement, Omit<PaginationLinkProps, 'children'>>(
  (props, ref) => {
    return (
      <PaginationLink ref={ref} {...props}>
        <ChevronLeftIcon fontSize="small" />
      </PaginationLink>
    )
  }
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = forwardRef<HTMLButtonElement, Omit<PaginationLinkProps, 'children'>>(
  (props, ref) => {
    return (
      <PaginationLink ref={ref} {...props}>
        <ChevronRightIcon fontSize="small" />
      </PaginationLink>
    )
  }
)
PaginationNext.displayName = 'PaginationNext'

export {
  Pagination,
  SimplePagination,
  TablePagination,
  PaginationContent,
  PaginationItemWrapper as PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
}
