'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  TableContainer,
  Paper,
  TableFooter as MuiTableFooter,
} from '@mui/material'

interface TableProps {
  children: ReactNode
  className?: string
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, ...props }, ref) => {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <MuiTable ref={ref} size="small" {...props}>
          {children}
        </MuiTable>
      </TableContainer>
    )
  }
)
Table.displayName = 'Table'

interface TableHeaderProps {
  children: ReactNode
  className?: string
}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableHead ref={ref} sx={{ bgcolor: 'action.hover' }} {...props}>
        {children}
      </MuiTableHead>
    )
  }
)
TableHeader.displayName = 'TableHeader'

interface TableBodyProps {
  children: ReactNode
  className?: string
}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, ...props }, ref) => {
    return <MuiTableBody ref={ref} {...props}>{children}</MuiTableBody>
  }
)
TableBody.displayName = 'TableBody'

interface TableFooterProps {
  children: ReactNode
  className?: string
}

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableFooter ref={ref} sx={{ bgcolor: 'action.hover' }} {...props}>
        {children}
      </MuiTableFooter>
    )
  }
)
TableFooter.displayName = 'TableFooter'

interface TableRowProps {
  children: ReactNode
  className?: string
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableRow
        ref={ref}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          '&:hover': { bgcolor: 'action.hover' },
        }}
        {...props}
      >
        {children}
      </MuiTableRow>
    )
  }
)
TableRow.displayName = 'TableRow'

interface TableHeadProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <MuiTableCell
        ref={ref}
        component="th"
        onClick={onClick}
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { bgcolor: 'action.hover' } : {},
        }}
        {...props}
      >
        {children}
      </MuiTableCell>
    )
  }
)
TableHead.displayName = 'TableHead'

interface TableCellProps {
  children?: ReactNode
  className?: string
  colSpan?: number
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableCell ref={ref} sx={{ fontSize: '0.875rem' }} {...props}>
        {children}
      </MuiTableCell>
    )
  }
)
TableCell.displayName = 'TableCell'

interface TableCaptionProps {
  children: ReactNode
  className?: string
}

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ children, ...props }, ref) => {
    return (
      <caption ref={ref} style={{ captionSide: 'bottom', padding: '16px', color: 'inherit', fontSize: '0.875rem' }} {...props}>
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
