-- Row rendering utilities

---@class Rows
local M = {}

---@class TextCell
---@field type "text"
---@field content string Cell content
---@field align? "right" Text alignment (optional)

---@class ActionsCell
---@field type "actions"
---@field buttons Action[] Action buttons for the cell

---@alias Cell TextCell | ActionsCell

---@class Row
---@field index integer Row index (1-indexed)
---@field cells Cell[] Array of rendered cells
---@field selected boolean Whether the row is selected

---@class RowData
---@field [string] any Key-value pairs representing row data

---Render a single cell based on column type
---@param column Column Column definition
---@param value any Cell value
---@return Cell
function M.render_cell(column, value)
  if column.type == "date" then
    return { type = "text", content = value }
  elseif column.type == "number" then
    return { type = "text", content = tostring(value), align = "right" }
  elseif column.type == "actions" then
    return { type = "actions", buttons = column.actions }
  else
    return { type = "text", content = value or "" }
  end
end

---Render a single row with all its cells
---@param columns Column[] Array of column definitions
---@param data RowData Row data object
---@param index integer Row index (1-indexed)
---@return Row
function M.render_row(columns, data, index)
  local cells = {}
  for _, col in ipairs(columns) do
    table.insert(cells, M.render_cell(col, data[col.id]))
  end
  return {
    index = index,
    cells = cells,
    selected = false
  }
end

---Render multiple rows from data list
---@param columns Column[] Array of column definitions
---@param data_list RowData[] Array of row data objects
---@return Row[]
function M.render_rows(columns, data_list)
  local rows = {}
  for i, data in ipairs(data_list) do
    table.insert(rows, M.render_row(columns, data, i))
  end
  return rows
end

return M
