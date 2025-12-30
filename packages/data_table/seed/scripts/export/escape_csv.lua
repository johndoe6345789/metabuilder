-- Escape a value for CSV
-- Single function module for data table export

---@class EscapeCsv
local M = {}

---Escape a value for CSV
---@param value any Value to escape
---@return string Escaped CSV string
function M.escapeCsv(value)
  if value == nil then
    return ""
  end
  
  local str = tostring(value)
  
  -- Check if escaping is needed
  if string.find(str, '[,"\r\n]') then
    -- Escape double quotes by doubling them
    str = string.gsub(str, '"', '""')
    -- Wrap in double quotes
    str = '"' .. str .. '"'
  end
  
  return str
end

return M
