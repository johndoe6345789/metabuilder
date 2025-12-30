'use client'

import { forwardRef, ReactNode } from 'react'

import {
  Paper,
  Table,
  TableBody as FakemuiTableBody,
  TableContainer,
  TableFooter as FakemuiTableFooter,
  TableHead as FakemuiTableHead,
} from '@/fakemui'

// Table wrapper with container
export interface TableProps {
  children: ReactNode
  className?: string
  stickyHeader?: boolean
}

const TableCore = forwardRef<HTMLTableElement, TableProps>(
  ({ children, stickyHeader, className, ...props }, ref) => {
    return (
      <TableContainer>
        <Paper className={`table-wrapper ${className || ''}`}>
          <Table ref={ref} stickyHeader={stickyHeader} size="small" {...props}>
            {children}
          </Table>
        </Paper>
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
    <FakemuiTableHead ref={ref} {...props}>
      {children}
    </FakemuiTableHead>
  )
})
TableHeader.displayName = 'TableHeader'

// TableBody
const TableBody = forwardRef<HTMLTableSectionElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <FakemuiTableBody ref={ref} {...props}>
        {children}
      </FakemuiTableBody>
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
    <FakemuiTableFooter ref={ref} {...props}>
      {children}
    </FakemuiTableFooter>
  )
})
TableFooter.displayName = 'TableFooter'

export { TableBody, TableCore, TableFooter, TableHeader }
