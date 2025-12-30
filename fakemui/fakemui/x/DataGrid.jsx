import React, { useState, useMemo, useCallback, forwardRef } from 'react'
import { classNames } from '../utils/classNames'

/**
 * DataGrid - A powerful data table component
 */
export const DataGrid = forwardRef(function DataGrid(
  {
    rows = [],
    columns = [],
    pageSize: controlledPageSize = 10,
    rowsPerPageOptions = [5, 10, 25, 50],
    pagination = true,
    checkboxSelection = false,
    disableSelectionOnClick = false,
    onSelectionModelChange,
    selectionModel: controlledSelectionModel,
    sortModel: controlledSortModel,
    onSortModelChange,
    filterModel,
    onFilterModelChange,
    loading = false,
    error,
    autoHeight = false,
    density = 'standard',
    disableColumnMenu = false,
    disableColumnSelector = false,
    disableColumnFilter = false,
    getRowId = (row) => row.id,
    onRowClick,
    onCellClick,
    className,
    style,
    ...props
  },
  ref
) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(controlledPageSize)
  const [internalSortModel, setInternalSortModel] = useState([])
  const [internalSelectionModel, setInternalSelectionModel] = useState([])

  const sortModel = controlledSortModel ?? internalSortModel
  const selectionModel = controlledSelectionModel ?? internalSelectionModel

  // Sort rows
  const sortedRows = useMemo(() => {
    if (sortModel.length === 0) return rows

    const { field, sort } = sortModel[0]
    return [...rows].sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]
      
      if (aValue === bValue) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1
      
      const comparison = aValue < bValue ? -1 : 1
      return sort === 'desc' ? -comparison : comparison
    })
  }, [rows, sortModel])

  // Paginate rows
  const paginatedRows = useMemo(() => {
    if (!pagination) return sortedRows
    const start = page * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [sortedRows, page, pageSize, pagination])

  const handleSort = useCallback((field) => {
    const currentSort = sortModel.find((s) => s.field === field)
    let newSort

    if (!currentSort) {
      newSort = [{ field, sort: 'asc' }]
    } else if (currentSort.sort === 'asc') {
      newSort = [{ field, sort: 'desc' }]
    } else {
      newSort = []
    }

    if (controlledSortModel === undefined) {
      setInternalSortModel(newSort)
    }
    onSortModelChange?.(newSort)
  }, [sortModel, controlledSortModel, onSortModelChange])

  const handleSelectAll = useCallback((e) => {
    const newSelection = e.target.checked ? rows.map(getRowId) : []
    if (controlledSelectionModel === undefined) {
      setInternalSelectionModel(newSelection)
    }
    onSelectionModelChange?.(newSelection)
  }, [rows, getRowId, controlledSelectionModel, onSelectionModelChange])

  const handleSelectRow = useCallback((rowId) => {
    const newSelection = selectionModel.includes(rowId)
      ? selectionModel.filter((id) => id !== rowId)
      : [...selectionModel, rowId]
    
    if (controlledSelectionModel === undefined) {
      setInternalSelectionModel(newSelection)
    }
    onSelectionModelChange?.(newSelection)
  }, [selectionModel, controlledSelectionModel, onSelectionModelChange])

  const totalPages = Math.ceil(rows.length / pageSize)

  return (
    <div
      ref={ref}
      className={classNames(
        'fakemui-data-grid',
        `fakemui-data-grid-density-${density}`,
        className,
        {
          'fakemui-data-grid-autoheight': autoHeight,
          'fakemui-data-grid-loading': loading,
        }
      )}
      style={style}
      {...props}
    >
      {/* Header */}
      <div className="fakemui-data-grid-header">
        <div className="fakemui-data-grid-row fakemui-data-grid-header-row">
          {checkboxSelection && (
            <div className="fakemui-data-grid-cell fakemui-data-grid-cell-checkbox">
              <input
                type="checkbox"
                checked={selectionModel.length === rows.length && rows.length > 0}
                onChange={handleSelectAll}
              />
            </div>
          )}
          {columns.map((col) => (
            <div
              key={col.field}
              className={classNames('fakemui-data-grid-cell', 'fakemui-data-grid-header-cell', {
                'fakemui-data-grid-cell-sortable': col.sortable !== false,
              })}
              style={{ width: col.width, flex: col.flex }}
              onClick={() => col.sortable !== false && handleSort(col.field)}
            >
              <span className="fakemui-data-grid-header-title">{col.headerName || col.field}</span>
              {sortModel[0]?.field === col.field && (
                <span className="fakemui-data-grid-sort-icon">
                  {sortModel[0].sort === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="fakemui-data-grid-body">
        {loading && (
          <div className="fakemui-data-grid-loading-overlay">
            <div className="fakemui-data-grid-loading-spinner" />
          </div>
        )}
        {error && (
          <div className="fakemui-data-grid-error-overlay">{error}</div>
        )}
        {!loading && !error && paginatedRows.length === 0 && (
          <div className="fakemui-data-grid-no-rows">No rows</div>
        )}
        {paginatedRows.map((row) => {
          const rowId = getRowId(row)
          const isSelected = selectionModel.includes(rowId)
          
          return (
            <div
              key={rowId}
              className={classNames('fakemui-data-grid-row', {
                'fakemui-data-grid-row-selected': isSelected,
              })}
              onClick={(e) => {
                if (!disableSelectionOnClick && checkboxSelection) {
                  handleSelectRow(rowId)
                }
                onRowClick?.({ row, id: rowId }, e)
              }}
            >
              {checkboxSelection && (
                <div className="fakemui-data-grid-cell fakemui-data-grid-cell-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectRow(rowId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              {columns.map((col) => (
                <div
                  key={col.field}
                  className="fakemui-data-grid-cell"
                  style={{ width: col.width, flex: col.flex }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onCellClick?.({ row, field: col.field, value: row[col.field] }, e)
                  }}
                >
                  {col.renderCell
                    ? col.renderCell({ row, value: row[col.field], field: col.field })
                    : col.valueFormatter
                      ? col.valueFormatter({ value: row[col.field] })
                      : row[col.field]
                  }
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Footer with pagination */}
      {pagination && (
        <div className="fakemui-data-grid-footer">
          <div className="fakemui-data-grid-pagination">
            <span className="fakemui-data-grid-pagination-info">
              Rows per page:
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(0)
                }}
              >
                {rowsPerPageOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </span>
            <span className="fakemui-data-grid-pagination-range">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, rows.length)} of {rows.length}
            </span>
            <button
              className="fakemui-data-grid-pagination-btn"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            <button
              className="fakemui-data-grid-pagination-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

/**
 * DataGridPro - Extended DataGrid with more features (placeholder)
 */
export const DataGridPro = forwardRef(function DataGridPro(props, ref) {
  return <DataGrid ref={ref} {...props} />
})

/**
 * DataGridPremium - Premium DataGrid with all features (placeholder)
 */
export const DataGridPremium = forwardRef(function DataGridPremium(props, ref) {
  return <DataGrid ref={ref} {...props} />
})

export default DataGrid
