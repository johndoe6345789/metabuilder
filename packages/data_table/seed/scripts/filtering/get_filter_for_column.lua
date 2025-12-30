-- Get active filter for a column
-- Single function module for data table filtering

---@class GetFilterForColumn
local M = {}

---Get active filter for a column
---@param state FilterState Current filter state
---@param column_id string Column identifier
---@return Filter|nil Active filter for column, or nil
function M.getFilterForColumn(state, column_id)
  for _, filter in ipairs(state.filters) do
    if filter.column_id == column_id then
      return filter
    end
  end
  return nil
end

return M
