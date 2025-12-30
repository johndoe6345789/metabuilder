-- Check if a value matches a filter
-- Single function module for data table filtering

---@class MatchesFilter
local M = {}

---Check if a value matches a filter
---@param value any Value to check
---@param filter Filter Filter to apply
---@return boolean Whether value matches filter
function M.matchesFilter(value, filter)
  local op = filter.operator
  local filterVal = filter.value
  
  -- Handle nil values
  if value == nil then
    return op == "equals" and filterVal == nil
  end
  
  if op == "equals" then
    return value == filterVal
  elseif op == "contains" then
    return string.find(string.lower(tostring(value)), string.lower(tostring(filterVal)), 1, true) ~= nil
  elseif op == "startsWith" then
    local str = string.lower(tostring(value))
    local prefix = string.lower(tostring(filterVal))
    return string.sub(str, 1, #prefix) == prefix
  elseif op == "endsWith" then
    local str = string.lower(tostring(value))
    local suffix = string.lower(tostring(filterVal))
    return string.sub(str, -#suffix) == suffix
  elseif op == "gt" then
    return tonumber(value) and tonumber(value) > tonumber(filterVal)
  elseif op == "lt" then
    return tonumber(value) and tonumber(value) < tonumber(filterVal)
  elseif op == "gte" then
    return tonumber(value) and tonumber(value) >= tonumber(filterVal)
  elseif op == "lte" then
    return tonumber(value) and tonumber(value) <= tonumber(filterVal)
  elseif op == "between" then
    local num = tonumber(value)
    return num and num >= filterVal[1] and num <= filterVal[2]
  end
  
  return false
end

return M
