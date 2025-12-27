'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableFooter as MuiTableFooter,
  TableContainer,
  Paper,
} from '@mui/material'

// Table wrapper with container
export interface TableProps {
  children: ReactNode
  className?: string
  stickyHeader?: boolean
}

const TableCore = forwardRef<HTMLTableElement, TableProps>(
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
TableCore.displayName = 'TableCore'

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

export {
  TableCore,
  TableHeader,
  TableBody,
  TableFooter,
}
