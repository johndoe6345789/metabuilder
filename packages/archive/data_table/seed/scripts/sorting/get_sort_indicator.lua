-- Get sort indicator for a column
-- Single function module for data table sorting

---@class GetSortIndicator
local M = {}

---Get sort indicator for a column
---@param state SortState Current sort state
---@param column_id string Column identifier to check
---@return string|nil Sort indicator ("▲", "▼", or nil)
function M.getSortIndicator(state, column_id)
  if state.column_id ~= column_id then
    return nil
  elseif state.direction == "asc" then
    return "▲"
  else
    return "▼"
  end
end

return M
