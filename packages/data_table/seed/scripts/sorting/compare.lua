-- Compare two values for sorting
-- Single function module for data table sorting

---@class Compare
local M = {}

---Compare two values for sorting
---@param a any First value
---@param b any Second value
---@param direction SortDirection Sort direction
---@return boolean Whether a should come before b
function M.compare(a, b, direction)
  local aVal = a
  local bVal = b
  
  -- Handle nil values (push to end)
  if aVal == nil and bVal == nil then return false end
  if aVal == nil then return direction == "desc" end
  if bVal == nil then return direction == "asc" end
  
  -- Handle different types
  local aType = type(aVal)
  local bType = type(bVal)
  
  if aType ~= bType then
    aVal = tostring(aVal)
    bVal = tostring(bVal)
  end
  
  -- Compare based on type
  if aType == "number" then
    if direction == "desc" then
      return aVal > bVal
    else
      return aVal < bVal
    end
  else
    -- String comparison (case-insensitive)
    local aLower = string.lower(tostring(aVal))
    local bLower = string.lower(tostring(bVal))
    if direction == "desc" then
      return aLower > bLower
    else
      return aLower < bLower
    end
  end
end

return M
