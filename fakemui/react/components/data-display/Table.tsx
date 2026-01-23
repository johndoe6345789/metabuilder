import React from 'react'
import styles from '../../styles/components/Table.module.scss'

export type TableSize = 'small' | 'medium' | 'large'
export type TablePadding = 'checkbox' | 'none' | 'normal'
export type TableAlign = 'left' | 'center' | 'right' | 'justify'

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode
  /** Size variant */
  size?: TableSize
  /** Enable sticky header */
  stickyHeader?: boolean
  /** Enable striped rows */
  striped?: boolean
  /** Enable bordered variant */
  bordered?: boolean
  /** Compact mode */
  compact?: boolean
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  size = 'medium',
  stickyHeader = false,
  striped = false,
  bordered = false,
  compact = false,
  ...props
}) => {
  const classes = [
    styles.table,
    styles[size],
    stickyHeader && styles.stickyHeader,
    striped && styles.striped,
    bordered && styles.bordered,
    compact && styles.compact,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <table className={classes} {...props}>
      {children}
    </table>
  )
}

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className = '', ...props }) => (
  <thead className={`${styles.head} ${className}`} {...props}>
    {children}
  </thead>
)

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '', ...props }) => (
  <tbody className={`${styles.body} ${className}`} {...props}>
    {children}
  </tbody>
)

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode
}

export const TableFooter: React.FC<TableFooterProps> = ({ children, className = '', ...props }) => (
  <tfoot className={`${styles.footer} ${className}`} {...props}>
    {children}
  </tfoot>
)

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode
  /** Enable hover effect */
  hover?: boolean
  /** Selected state */
  selected?: boolean
  /** Make row clickable */
  onClick?: React.MouseEventHandler<HTMLTableRowElement>
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  hover,
  selected,
  onClick,
  className = '',
  ...props
}) => {
  const classes = [
    styles.row,
    hover && styles.hover,
    selected && styles.selected,
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <tr className={classes} onClick={onClick} {...props}>
      {children}
    </tr>
  )
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode
  /** Render as th element */
  header?: boolean
  /** Text alignment */
  align?: TableAlign
  /** Cell padding variant */
  padding?: TablePadding
  /** Scope for header cells */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup'
  /** Enable sorting on this cell */
  sortDirection?: 'asc' | 'desc' | false
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  header,
  align = 'left',
  padding = 'normal',
  scope,
  sortDirection,
  className = '',
  ...props
}) => {
  const Tag = header ? 'th' : 'td'
  const classes = [
    styles.cell,
    align && styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`],
    padding === 'checkbox' && styles.paddingCheckbox,
    padding === 'none' && styles.paddingNone,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      className={classes}
      scope={header ? scope : undefined}
      aria-sort={sortDirection ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
      {...props}
    >
      {children}
    </Tag>
  )
}

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Max height for scrollable container */
  maxHeight?: number | string
}

export const TableContainer: React.FC<TableContainerProps> = ({
  children,
  maxHeight,
  className = '',
  style,
  ...props
}) => (
  <div
    className={`${styles.tableContainer} ${className}`}
    style={{ ...style, maxHeight }}
    {...props}
  >
    {children}
  </div>
)

export interface TablePaginationLabelDisplayedRowsArgs {
  from: number
  to: number
  count: number
  page: number
}

export interface TablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Total number of rows */
  count?: number
  /** Current page (0-indexed) */
  page?: number
  /** Number of rows per page */
  rowsPerPage?: number
  /** Options for rows per page dropdown */
  rowsPerPageOptions?: number[]
  /** Callback for page change */
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void
  /** Callback for rows per page change */
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  /** Label for rows per page dropdown */
  labelRowsPerPage?: React.ReactNode
  /** Custom label for displayed rows */
  labelDisplayedRows?: (args: TablePaginationLabelDisplayedRowsArgs) => React.ReactNode
  /** Show first page button */
  showFirstButton?: boolean
  /** Show last page button */
  showLastButton?: boolean
  /** Disable the back button beyond first page */
  backIconButtonDisabled?: boolean
  /** Disable the next button beyond last page */
  nextIconButtonDisabled?: boolean
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  count = 0,
  page = 0,
  rowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25],
  onPageChange,
  onRowsPerPageChange,
  labelRowsPerPage = 'Rows per page:',
  labelDisplayedRows = ({ from, to, count }) =>
    `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`,
  showFirstButton = false,
  showLastButton = false,
  backIconButtonDisabled,
  nextIconButtonDisabled,
  className = '',
  ...props
}) => {
  const from = count === 0 ? 0 : page * rowsPerPage + 1
  const to = count !== -1 ? Math.min((page + 1) * rowsPerPage, count) : (page + 1) * rowsPerPage
  const totalPages = count !== -1 ? Math.ceil(count / rowsPerPage) : -1

  const handleFirstPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange?.(e, 0)
  }

  const handlePrevPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange?.(e, page - 1)
  }

  const handleNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange?.(e, page + 1)
  }

  const handleLastPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange?.(e, Math.max(0, totalPages - 1))
  }

  const isBackDisabled = backIconButtonDisabled ?? page === 0
  const isNextDisabled = nextIconButtonDisabled ?? (totalPages !== -1 && page >= totalPages - 1)

  return (
    <div className={`${styles.pagination} ${className}`} {...props}>
      <span className={styles.paginationLabel}>{labelRowsPerPage}</span>
      <select
        className={styles.paginationSelect}
        value={rowsPerPage}
        onChange={(e) => onRowsPerPageChange?.(e)}
        aria-label="Rows per page"
      >
        {rowsPerPageOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className={styles.paginationDisplayed}>
        {labelDisplayedRows({ from, to, count, page })}
      </span>
      <div className={styles.paginationActions}>
        {showFirstButton && (
          <button
            className={styles.paginationBtn}
            disabled={isBackDisabled}
            onClick={handleFirstPage}
            aria-label="Go to first page"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>
        )}
        <button
          className={styles.paginationBtn}
          disabled={isBackDisabled}
          onClick={handlePrevPage}
          aria-label="Go to previous page"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          className={styles.paginationBtn}
          disabled={isNextDisabled}
          onClick={handleNextPage}
          aria-label="Go to next page"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        {showLastButton && (
          <button
            className={styles.paginationBtn}
            disabled={isNextDisabled}
            onClick={handleLastPage}
            aria-label="Go to last page"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export interface TableSortLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Whether this column is currently sorted */
  active?: boolean
  /** Sort direction */
  direction?: 'asc' | 'desc'
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void
  /** Label content */
  children?: React.ReactNode
  /** Hide sort icon when inactive */
  hideSortIcon?: boolean
  /** Custom icon component */
  IconComponent?: React.ComponentType<{ className?: string; direction?: 'asc' | 'desc' }>
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
  const classes = [styles.sortLabel, active && styles.active, className].filter(Boolean).join(' ')

  const sortIcon = IconComponent ? (
    <IconComponent className={`${styles.sortIcon} ${styles[direction]}`} direction={direction} />
  ) : (
    <span className={`${styles.sortIcon} ${styles[direction]}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12l7-7 7 7" />
      </svg>
    </span>
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(e)
    }
  }

  return (
    <span
      className={classes}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      {...props}
    >
      {children}
      {(!hideSortIcon || active) && sortIcon}
    </span>
  )
}
