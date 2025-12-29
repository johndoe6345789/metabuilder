-- Row rendering utilities
local M = {}

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

function M.render_rows(columns, data_list)
  local rows = {}
  for i, data in ipairs(data_list) do
    table.insert(rows, M.render_row(columns, data, i))
  end
  return rows
end

return M
