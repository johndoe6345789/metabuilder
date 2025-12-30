import React from 'react'

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode
}

export const Table: React.FC<TableProps> = ({ children, className = '', ...props }) => (
  <table className={`table ${className}`} {...props}>
    {children}
  </table>
)

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className = '', ...props }) => (
  <thead className={`table-head ${className}`} {...props}>
    {children}
  </thead>
)

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '', ...props }) => (
  <tbody className={`table-body ${className}`} {...props}>
    {children}
  </tbody>
)

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode
}

export const TableFooter: React.FC<TableFooterProps> = ({ children, className = '', ...props }) => (
  <tfoot className={`table-footer ${className}`} {...props}>
    {children}
  </tfoot>
)

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode
  hover?: boolean
  selected?: boolean
}

export const TableRow: React.FC<TableRowProps> = ({ children, hover, selected, className = '', ...props }) => (
  <tr
    className={`table-row ${hover ? 'table-row--hover' : ''} ${selected ? 'table-row--selected' : ''} ${className}`}
    {...props}
  >
    {children}
  </tr>
)

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode
  header?: boolean
  align?: 'left' | 'center' | 'right'
}

export const TableCell: React.FC<TableCellProps> = ({ children, header, align, className = '', ...props }) => {
  const Tag = header ? 'th' : 'td'
  return (
    <Tag className={`table-cell ${align ? `table-cell--${align}` : ''} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const TableContainer: React.FC<TableContainerProps> = ({ children, className = '', ...props }) => (
  <div className={`table-container ${className}`} {...props}>
    {children}
  </div>
)

export interface TablePaginationLabelDisplayedRowsArgs {
  from: number
  to: number
  count: number
}

export interface TablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  page?: number
  rowsPerPage?: number
  rowsPerPageOptions?: number[]
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement>, page: number) => void
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  labelRowsPerPage?: string
  labelDisplayedRows?: (args: TablePaginationLabelDisplayedRowsArgs) => string
  showFirstButton?: boolean
  showLastButton?: boolean
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  count = 0,
  page = 0,
  rowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25],
  onPageChange,
  onRowsPerPageChange,
  labelRowsPerPage = 'Rows per page:',
  labelDisplayedRows = ({ from, to, count }) => `${from}–${to} of ${count}`,
  showFirstButton = false,
  showLastButton = false,
  className = '',
  ...props
}) => {
  const from = count === 0 ? 0 : page * rowsPerPage + 1
  const to = Math.min((page + 1) * rowsPerPage, count)
  const totalPages = Math.ceil(count / rowsPerPage)

  return (
    <div className={`table-pagination ${className}`} {...props}>
      <span className="table-pagination-label">{labelRowsPerPage}</span>
      <select
        className="table-pagination-select"
        value={rowsPerPage}
        onChange={(e) => onRowsPerPageChange?.(e)}
      >
        {rowsPerPageOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className="table-pagination-displayed">{labelDisplayedRows({ from, to, count })}</span>
      <div className="table-pagination-actions">
        {showFirstButton && (
          <button
            className="table-pagination-btn"
            disabled={page === 0}
            onClick={(e) => onPageChange?.(e, 0)}
          >
            ⟨⟨
          </button>
        )}
        <button
          className="table-pagination-btn"
          disabled={page === 0}
          onClick={(e) => onPageChange?.(e, page - 1)}
        >
          ‹
        </button>
        <button
          className="table-pagination-btn"
          disabled={page >= totalPages - 1}
          onClick={(e) => onPageChange?.(e, page + 1)}
        >
          ›
        </button>
        {showLastButton && (
          <button
            className="table-pagination-btn"
            disabled={page >= totalPages - 1}
            onClick={(e) => onPageChange?.(e, totalPages - 1)}
          >
            ⟩⟩
          </button>
        )}
      </div>
    </div>
  )
}

export interface TableSortLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean
  direction?: 'asc' | 'desc'
  onClick?: (event: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void
  children?: React.ReactNode
  hideSortIcon?: boolean
  IconComponent?: React.ComponentType<{ className?: string }>
}

export const TableSortLabel: React.FC<TableSortLabelProps> = ({
  active = false,
  direction = 'asc',
  onClick,
  children,
  hideSortIcon = false,
  IconComponent,
  className = '',
  ...props
}) => {
  const sortIcon = IconComponent ? (
    <IconComponent className="table-sort-icon" />
  ) : (
    <span className="table-sort-icon">{direction === 'asc' ? '↑' : '↓'}</span>
  )

  return (
    <span
      className={`table-sort-label ${active ? 'table-sort-label--active' : ''} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(e)}
      {...props}
    >
      {children}
      {!hideSortIcon && (active || !hideSortIcon) && sortIcon}
    </span>
  )
}
