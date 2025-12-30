-- Add a filter to state
-- Single function module for data table filtering

---@class AddFilter
local M = {}

---Add a filter to state
---@param state FilterState Current filter state
---@param column_id string Column identifier
---@param operator FilterOperator Filter operator
---@param value any Filter value
---@return FilterState New filter state
function M.addFilter(state, column_id, operator, value)
  local newFilters = {}
  
  -- Copy existing filters (replacing any for same column)
  for _, filter in ipairs(state.filters) do
    if filter.column_id ~= column_id then
      table.insert(newFilters, filter)
    end
  end
  
  -- Add new filter
  table.insert(newFilters, {
    column_id = column_id,
    operator = operator,
    value = value
  })
  
  return { filters = newFilters }
end

return M
