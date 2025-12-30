import React, { useState } from 'react'

export const Table = ({ children, className = '', ...props }) => (
  <table className={`table ${className}`} {...props}>{children}</table>
)

export const TableHead = ({ children, className = '', ...props }) => (
  <thead className={`table-head ${className}`} {...props}>{children}</thead>
)

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`table-body ${className}`} {...props}>{children}</tbody>
)

export const TableFooter = ({ children, className = '', ...props }) => (
  <tfoot className={`table-footer ${className}`} {...props}>{children}</tfoot>
)

export const TableRow = ({ children, hover, selected, className = '', ...props }) => (
  <tr className={`table-row ${hover ? 'table-row--hover' : ''} ${selected ? 'table-row--selected' : ''} ${className}`} {...props}>{children}</tr>
)

export const TableCell = ({ children, header, align, className = '', ...props }) => {
  const Tag = header ? 'th' : 'td'
  return <Tag className={`table-cell ${align ? `table-cell--${align}` : ''} ${className}`} {...props}>{children}</Tag>
}

export const TableContainer = ({ children, className = '', ...props }) => (
  <div className={`table-container ${className}`} {...props}>{children}</div>
)

export const TablePagination = ({
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
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <span className="table-pagination-displayed">
        {labelDisplayedRows({ from, to, count })}
      </span>
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

export const TableSortLabel = ({
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
