'use client'

import { Box, FormControl, IconButton, Select, Typography } from '@/fakemui'
import { FirstPage as FirstPageIcon, LastPage as LastPageIcon } from '@/fakemui/icons'
import { forwardRef, ChangeEvent } from 'react'

import styles from './pagination.module.scss'
import { NextIcon, PreviousIcon } from './paginationIcons'

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

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
      onPageSizeChange(Number(event.target.value))
    }

    return (
      <Box
        ref={ref}
        className={styles.tablePagination}
        {...props}
      >
        <Box className={styles.tablePaginationRowsPerPage}>
          <Typography variant="body2" className={styles.tablePaginationLabel}>
            Rows per page:
          </Typography>
          <FormControl sm>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={disabled}
              sm
              className={styles.tablePaginationSelect}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="body2" className={styles.tablePaginationLabel}>
          {count === 0 ? '0' : `${startItem}-${endItem}`} of {count}
        </Typography>

        <Box className={styles.tablePaginationActions}>
          {showFirstLastButtons && (
            <IconButton
              onClick={() => onPageChange(1)}
              disabled={disabled || page === 1}
              sm
              aria-label="Go to first page"
            >
              <FirstPageIcon size={16} />
            </IconButton>
          )}
          <IconButton
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || page === 1}
            sm
            aria-label="Go to previous page"
          >
            <PreviousIcon />
          </IconButton>
          <IconButton
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page === totalPages}
            sm
            aria-label="Go to next page"
          >
            <NextIcon />
          </IconButton>
          {showFirstLastButtons && (
            <IconButton
              onClick={() => onPageChange(totalPages)}
              disabled={disabled || page === totalPages}
              sm
              aria-label="Go to last page"
            >
              <LastPageIcon size={16} />
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
