'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableFooter as MuiTableFooter,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  TableContainer,
  Paper,
  TableCellProps as MuiTableCellProps,
} from '@mui/material'

// Table wrapper with container
export interface TableProps {
  children: ReactNode
  className?: string
  stickyHeader?: boolean
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, stickyHeader, ...props }, ref) => {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
        <MuiTable ref={ref} stickyHeader={stickyHeader} size="small" {...props}>
          {children}
        </MuiTable>
      </TableContainer>
    )
  }
)
Table.displayName = 'Table'

// TableHeader
const TableHeader = forwardRef<HTMLTableSectionElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return <MuiTableHead ref={ref} {...props}>{children}</MuiTableHead>
  }
)
TableHeader.displayName = 'TableHeader'

// TableBody
const TableBody = forwardRef<HTMLTableSectionElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return <MuiTableBody ref={ref} {...props}>{children}</MuiTableBody>
  }
)
TableBody.displayName = 'TableBody'

// TableFooter
const TableFooter = forwardRef<HTMLTableSectionElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return <MuiTableFooter ref={ref} {...props}>{children}</MuiTableFooter>
  }
)
TableFooter.displayName = 'TableFooter'

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
const TableCaption = forwardRef<HTMLTableCaptionElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
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
  }
)
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
