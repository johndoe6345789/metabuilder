'use client'

import { forwardRef, ReactNode } from 'react'
import {
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  TableCellProps as MuiTableCellProps,
} from '@mui/material'

// TableRow
export interface TableRowProps {
  children: ReactNode
  className?: string
  selected?: boolean
  hover?: boolean
  onClick?: () => void
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, selected, hover = true, ...props }, ref) => {
    return (
      <MuiTableRow
        ref={ref}
        selected={selected}
        hover={hover}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
        }}
        {...props}
      >
        {children}
      </MuiTableRow>
    )
  }
)
TableRow.displayName = 'TableRow'

// TableHead (cell in header)
export interface TableHeadProps extends MuiTableCellProps {
  className?: string
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, sx, ...props }, ref) => {
    return (
      <MuiTableCell
        ref={ref}
        component="th"
        sx={{
          fontWeight: 600,
          bgcolor: 'action.hover',
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiTableCell>
    )
  }
)
TableHead.displayName = 'TableHead'

// TableCell
export interface TableCellProps extends MuiTableCellProps {
  className?: string
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableCell ref={ref} {...props}>
        {children}
      </MuiTableCell>
    )
  }
)
TableCell.displayName = 'TableCell'

// TableCaption
const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  { children: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      style={{
        captionSide: 'bottom',
        padding: '12px',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
      }}
      {...props}
    >
      {children}
    </caption>
  )
})
TableCaption.displayName = 'TableCaption'

export { TableRow, TableHead, TableCell, TableCaption }
