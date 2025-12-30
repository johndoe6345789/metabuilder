// TODO: Split this file (173 LOC) into smaller organisms (<150 LOC each)
'use client'

import {
  Table as FakeMuiTable,
  TableBody as FakeMuiTableBody,
  TableCell as FakeMuiTableCell,
  TableContainer as FakeMuiTableContainer,
  TableFooter as FakeMuiTableFooter,
  TableHead as FakeMuiTableHead,
  TableRow as FakeMuiTableRow,
} from '@/fakemui'
import { forwardRef, ReactNode } from 'react'

import styles from './Table.module.scss'

interface TableProps {
  children: ReactNode
  className?: string
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiTableContainer className={`${styles.tableContainer} ${className}`}>
        <FakeMuiTable ref={ref} size="small" {...props}>
          {children}
        </FakeMuiTable>
      </FakeMuiTableContainer>
    )
  }
)
Table.displayName = 'Table'

interface TableHeaderProps {
  children: ReactNode
  className?: string
}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiTableHead ref={ref} className={`${styles.tableHeader} ${className}`} {...props}>
        {children}
      </FakeMuiTableHead>
    )
  }
)
TableHeader.displayName = 'TableHeader'

interface TableBodyProps {
  children: ReactNode
  className?: string
}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiTableBody ref={ref} className={className} {...props}>
        {children}
      </FakeMuiTableBody>
    )
  }
)
TableBody.displayName = 'TableBody'

interface TableFooterProps {
  children: ReactNode
  className?: string
}

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiTableFooter ref={ref} className={`${styles.tableFooter} ${className}`} {...props}>
        {children}
      </FakeMuiTableFooter>
    )
  }
)
TableFooter.displayName = 'TableFooter'

interface TableRowProps {
  children: ReactNode
  className?: string
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiTableRow ref={ref} hover className={`${styles.tableRow} ${className}`} {...props}>
        {children}
      </FakeMuiTableRow>
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
  ({ children, onClick, className = '', ...props }, ref) => {
    return (
      <FakeMuiTableCell
        ref={ref}
        header
        onClick={onClick}
        className={`${styles.tableHeadCell} ${onClick ? styles.clickable : ''} ${className}`}
        {...props}
      >
        {children}
      </FakeMuiTableCell>
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
  ({ children, className = '', ...props }, ref) => {
    return (
      <FakeMuiTableCell ref={ref} className={`${styles.tableCell} ${className}`} {...props}>
        {children}
      </FakeMuiTableCell>
    )
  }
)
TableCell.displayName = 'TableCell'

interface TableCaptionProps {
  children: ReactNode
  className?: string
}

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <caption ref={ref} className={`${styles.tableCaption} ${className}`} {...props}>
        {children}
      </caption>
    )
  }
)
TableCaption.displayName = 'TableCaption'

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
