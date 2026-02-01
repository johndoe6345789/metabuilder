'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { classNames } from '../utils/classNames'

export interface GridColDef {
  field: string
  headerName: string
  width?: number
  flex?: number
  sortable?: boolean
  filterable?: boolean
  renderCell?: (params: GridRenderCellParams) => React.ReactNode
  valueGetter?: (params: GridValueGetterParams) => any
  valueFormatter?: (params: GridValueFormatterParams) => string
  editable?: boolean
  type?: 'string' | 'number' | 'date' | 'boolean' | 'actions'
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
}

export interface GridRenderCellParams {
  value: any
  row: any
  field: string
  id: string | number
}

export interface GridValueGetterParams {
  row: any
  field: string
  id: string | number
}

export interface GridValueFormatterParams {
  value: any
  field: string
  id: string | number
}

export interface GridRowParams {
  row: any
  id: string | number
}

export interface GridSortModel {
  field: string
  sort: 'asc' | 'desc' | null
}

export interface GridFilterModel {
  items: GridFilterItem[]
}

export interface GridFilterItem {
  field: string
  operator: string
  value: any
}

export interface DataGridProps {
  rows: any[]
  columns: GridColDef[]
  pageSize?: number
  rowsPerPageOptions?: number[]
  checkboxSelection?: boolean
  disableSelectionOnClick?: boolean
  onRowClick?: (params: GridRowParams) => void
  onSelectionModelChange?: (ids: (string | number)[]) => void
  loading?: boolean
  autoHeight?: boolean
  density?: 'compact' | 'standard' | 'comfortable'
  sortModel?: GridSortModel[]
  onSortModelChange?: (model: GridSortModel[]) => void
  filterModel?: GridFilterModel
  onFilterModelChange?: (model: GridFilterModel) => void
  getRowId?: (row: any) => string | number
  className?: string
  sx?: React.CSSProperties
}

/**
 * DataGrid - A powerful data table component
 */
export function DataGrid({
  rows,
  columns,
  pageSize = 25,
  rowsPerPageOptions = [10, 25, 50, 100],
  checkboxSelection = false,
  disableSelectionOnClick = false,
  onRowClick,
  onSelectionModelChange,
  loading = false,
  autoHeight = false,
  density = 'standard',
  sortModel,
  onSortModelChange,
  filterModel,
  onFilterModelChange,
  getRowId = (row) => row.id,
  className,
  sx,
}: DataGridProps) {
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const [internalSortModel, setInternalSortModel] = useState<GridSortModel[]>(sortModel || [])

  const currentSortModel = sortModel || internalSortModel

  const handleSort = useCallback((field: string) => {
    const existingSort = currentSortModel.find(s => s.field === field)
    let newSort: 'asc' | 'desc' | null = 'asc'
    
    if (existingSort) {
      if (existingSort.sort === 'asc') newSort = 'desc'
      else if (existingSort.sort === 'desc') newSort = null
    }
    
    const newModel = newSort
      ? [{ field, sort: newSort }]
      : []
    
    if (onSortModelChange) {
      onSortModelChange(newModel)
    } else {
      setInternalSortModel(newModel)
    }
  }, [currentSortModel, onSortModelChange])

  const sortedRows = useMemo(() => {
    if (currentSortModel.length === 0) return rows
    
    const sort = currentSortModel[0]
    if (!sort) return rows
    
    return [...rows].sort((a, b) => {
      const aVal = a[sort.field]
      const bVal = b[sort.field]
      
      if (aVal < bVal) return sort.sort === 'asc' ? -1 : 1
      if (aVal > bVal) return sort.sort === 'asc' ? 1 : -1
      return 0
    })
  }, [rows, currentSortModel])

  const paginatedRows = useMemo(() => {
    const start = page * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [sortedRows, page, pageSize])

  const totalPages = Math.ceil(rows.length / pageSize)

  const handleRowClick = (row: any) => {
    const id = getRowId(row)
    
    if (checkboxSelection && !disableSelectionOnClick) {
      const newSelected = new Set(selectedIds)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      setSelectedIds(newSelected)
      onSelectionModelChange?.(Array.from(newSelected))
    }
    
    onRowClick?.({ row, id })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set())
      onSelectionModelChange?.([])
    } else {
      const allIds = new Set(rows.map(getRowId))
      setSelectedIds(allIds)
      onSelectionModelChange?.(Array.from(allIds))
    }
  }

  const densityClass = {
    compact: 'fakemui-datagrid--compact',
    standard: '',
    comfortable: 'fakemui-datagrid--comfortable',
  }[density]

  return (
    <div
      className={classNames('fakemui-datagrid', densityClass, className)}
      style={{ ...sx, height: autoHeight ? 'auto' : '400px' }}
    >
      {loading && (
        <div className="fakemui-datagrid-loading">
          <div className="fakemui-datagrid-loading-spinner" />
        </div>
      )}
      
      <div className="fakemui-datagrid-container">
        <table className="fakemui-datagrid-table">
          <thead>
            <tr>
              {checkboxSelection && (
                <th className="fakemui-datagrid-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === rows.length && rows.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => {
                const sort = currentSortModel.find(s => s.field === col.field)
                return (
                  <th
                    key={col.field}
                    style={{
                      width: col.width,
                      flex: col.flex,
                      textAlign: col.headerAlign || 'left',
                    }}
                    onClick={() => col.sortable !== false && handleSort(col.field)}
                    className={classNames(
                      'fakemui-datagrid-header-cell',
                      col.sortable !== false && 'fakemui-datagrid-header-cell--sortable'
                    )}
                  >
                    {col.headerName}
                    {sort && (
                      <span className="fakemui-datagrid-sort-icon">
                        {sort.sort === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row) => {
              const id = getRowId(row)
              const isSelected = selectedIds.has(id)
              
              return (
                <tr
                  key={id}
                  onClick={() => handleRowClick(row)}
                  className={classNames(
                    'fakemui-datagrid-row',
                    isSelected && 'fakemui-datagrid-row--selected'
                  )}
                >
                  {checkboxSelection && (
                    <td className="fakemui-datagrid-checkbox-cell">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    let value = row[col.field]
                    
                    if (col.valueGetter) {
                      value = col.valueGetter({ row, field: col.field, id })
                    }
                    
                    if (col.valueFormatter) {
                      value = col.valueFormatter({ value, field: col.field, id })
                    }
                    
                    const cellContent = col.renderCell
                      ? col.renderCell({ value, row, field: col.field, id })
                      : value
                    
                    return (
                      <td
                        key={col.field}
                        style={{ textAlign: col.align || 'left' }}
                        className="fakemui-datagrid-cell"
                      >
                        {cellContent}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      <div className="fakemui-datagrid-footer">
        <div className="fakemui-datagrid-pagination">
          <span>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, rows.length)} of {rows.length}
          </span>
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="fakemui-datagrid-pagination-btn"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="fakemui-datagrid-pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

// Aliases for compatibility
export const DataGridPro = DataGrid
export const DataGridPremium = DataGrid
