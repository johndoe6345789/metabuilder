'use client'

import {
  TableCell as FakemuiTableCell,
  TableRow as FakemuiTableRow,
} from '@/fakemui'
import { forwardRef, ReactNode, ComponentProps } from 'react'

// TableRow
export interface TableRowProps {
  children: ReactNode
  className?: string
  selected?: boolean
  hover?: boolean
  onClick?: () => void
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, selected, hover = true, className, ...props }, ref) => {
    const classes = [
      'table-row',
      selected && 'table-row--selected',
      hover && 'table-row--hover',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <FakemuiTableRow ref={ref} className={classes} {...props}>
        {children}
      </FakemuiTableRow>
    )
  }
)
TableRow.displayName = 'TableRow'

// TableHead (cell in header)
export interface TableHeadProps extends ComponentProps<typeof FakemuiTableCell> {
  className?: string
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <FakemuiTableCell
        ref={ref}
        component="th"
        className={`table-head-cell ${className || ''}`}
        {...props}
      >
        {children}
      </FakemuiTableCell>
    )
  }
)
TableHead.displayName = 'TableHead'

// TableCell
export interface TableCellProps extends ComponentProps<typeof FakemuiTableCell> {
  className?: string
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, ...props }, ref) => {
    return (
      <FakemuiTableCell ref={ref} {...props}>
        {children}
      </FakemuiTableCell>
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

export { TableCaption, TableCell, TableHead, TableRow }
