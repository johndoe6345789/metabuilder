-- Remove a filter from state
-- Single function module for data table filtering

---@class RemoveFilter
local M = {}

---Remove a filter from state
---@param state FilterState Current filter state
---@param column_id string Column identifier to remove
---@return FilterState New filter state
function M.removeFilter(state, column_id)
  local newFilters = {}
  
  for _, filter in ipairs(state.filters) do
    if filter.column_id ~= column_id then
      table.insert(newFilters, filter)
    end
  end
  
  return { filters = newFilters }
end

return M
