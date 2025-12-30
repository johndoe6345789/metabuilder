-- Serialize a value to JSON
-- Single function module for data table export

---@class JsonEncode
local M = {}

---Serialize a value to JSON
---@param value any Value to serialize
---@return string JSON string
function M.jsonEncode(value)
  local t = type(value)
  
  if value == nil then
    return "null"
  elseif t == "boolean" then
    return value and "true" or "false"
  elseif t == "number" then
    return tostring(value)
  elseif t == "string" then
    -- Escape special characters
    local escaped = value
    escaped = string.gsub(escaped, '\\', '\\\\')
    escaped = string.gsub(escaped, '"', '\\"')
    escaped = string.gsub(escaped, '\n', '\\n')
    escaped = string.gsub(escaped, '\r', '\\r')
    escaped = string.gsub(escaped, '\t', '\\t')
    return '"' .. escaped .. '"'
  elseif t == "table" then
    -- Check if array or object
    local isArray = true
    local maxIndex = 0
    for k, _ in pairs(value) do
      if type(k) ~= "number" or k < 1 or k ~= math.floor(k) then
        isArray = false
        break
      end
      if k > maxIndex then maxIndex = k end
    end
    isArray = isArray and maxIndex == #value
    
    if isArray then
      local items = {}
      for _, v in ipairs(value) do
        table.insert(items, M.jsonEncode(v))
      end
      return "[" .. table.concat(items, ",") .. "]"
    else
      local items = {}
      for k, v in pairs(value) do
        table.insert(items, M.jsonEncode(tostring(k)) .. ":" .. M.jsonEncode(v))
      end
      return "{" .. table.concat(items, ",") .. "}"
    end
  end
  
  return "null"
end

return M
