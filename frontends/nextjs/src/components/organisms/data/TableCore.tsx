'use client'

import {
  Paper,
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableContainer,
  TableFooter as MuiTableFooter,
  TableHead as MuiTableHead,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

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
const TableHeader = forwardRef<
  HTMLTableSectionElement,
  { children: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <MuiTableHead ref={ref} {...props}>
      {children}
    </MuiTableHead>
  )
})
TableHeader.displayName = 'TableHeader'

// TableBody
const TableBody = forwardRef<HTMLTableSectionElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableBody ref={ref} {...props}>
        {children}
      </MuiTableBody>
    )
  }
)
TableBody.displayName = 'TableBody'

// TableFooter
const TableFooter = forwardRef<
  HTMLTableSectionElement,
  { children: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <MuiTableFooter ref={ref} {...props}>
      {children}
    </MuiTableFooter>
  )
})
TableFooter.displayName = 'TableFooter'

export { TableBody, TableCore, TableFooter,TableHeader }
