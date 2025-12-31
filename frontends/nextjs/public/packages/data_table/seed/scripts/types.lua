-- Type definitions for data_table package
-- Central types file consolidating all module types
-- @meta

-- Re-export module types
local filtering_types = require("filtering.types")
local sorting_types = require("sorting.types")
local selection_types = require("selection.types")

---@alias SortDirection "asc"|"desc"|nil

---@alias FilterOperator "equals"|"contains"|"startsWith"|"endsWith"|"gt"|"lt"|"gte"|"lte"|"between"|"in"|"notIn"|"isNull"|"isNotNull"

---@alias ColumnAlign "left"|"center"|"right"

---@alias ColumnType "string"|"number"|"boolean"|"date"|"datetime"|"currency"|"percentage"|"custom"

---@class ColumnDefinition
---@field id string Unique column identifier
---@field header string Column header text
---@field accessor string|fun(row: table): any Data accessor (field name or function)
---@field type ColumnType Column data type for formatting
---@field width? number|string Column width (px or %)
---@field minWidth? number Minimum column width
---@field maxWidth? number Maximum column width
---@field align? ColumnAlign Text alignment
---@field sortable? boolean Whether column is sortable
---@field filterable? boolean Whether column is filterable
---@field resizable? boolean Whether column is resizable
---@field hidden? boolean Whether column is hidden
---@field pinned? "left"|"right"|nil Pin column to side
---@field render? fun(value: any, row: table): UIComponent Custom render function
---@field format? string Format string for type-based formatting
---@field filterOperators? FilterOperator[] Available filter operators

---@class RowData
---@field id string|number Unique row identifier
---@field [string] any Row data fields

---@class Filter
---@field columnId string Column identifier to filter
---@field operator FilterOperator Filter operator
---@field value any Filter value (single value or {min, max} for between)
---@field active boolean Whether filter is active

---@class FilterState
---@field filters Filter[] Active filters
---@field globalSearch string Global search term

---@class SortConfig
---@field columnId string Column to sort by
---@field direction SortDirection Sort direction

---@class SelectionState
---@field selectedIds table<string|number, boolean> Map of selected row IDs
---@field selectAll boolean Whether all rows are selected
---@field invertSelection boolean Whether selection is inverted

---@class PaginationState
---@field page number Current page (1-indexed)
---@field pageSize number Items per page
---@field totalItems number Total number of items
---@field totalPages number Total number of pages

---@class DataTableConfig
---@field columns ColumnDefinition[] Table columns
---@field data RowData[] Table data
---@field sortable? boolean Enable sorting
---@field filterable? boolean Enable filtering
---@field selectable? boolean Enable row selection
---@field paginated? boolean Enable pagination
---@field pageSize? number Default page size
---@field pageSizeOptions? number[] Available page sizes
---@field loading? boolean Loading state
---@field error? string Error message
---@field emptyMessage? string Message when no data
---@field stickyHeader? boolean Sticky header
---@field virtualized? boolean Enable virtualization for large datasets
---@field rowHeight? number Row height for virtualization
---@field onRowClick? fun(row: RowData): void Row click handler
---@field onSelectionChange? fun(selected: RowData[]): void Selection change handler
---@field onSortChange? fun(sort: SortConfig): void Sort change handler
---@field onFilterChange? fun(filters: FilterState): void Filter change handler
---@field onPageChange? fun(pagination: PaginationState): void Page change handler

---@class ExportOptions
---@field format "csv"|"json"|"xlsx" Export format
---@field filename string Output filename
---@field columns? string[] Columns to export (nil = all)
---@field includeHeaders boolean Include column headers
---@field selectedOnly boolean Export only selected rows

---@class ExportResult
---@field success boolean Whether export succeeded
---@field data string|nil Exported data string
---@field error string|nil Error message

---@class DataTableState
---@field data RowData[] Current data
---@field filteredData RowData[] Data after filtering
---@field displayData RowData[] Data for current page
---@field sorting SortConfig|nil Current sort configuration
---@field filters FilterState Filter state
---@field selection SelectionState Selection state
---@field pagination PaginationState Pagination state

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
