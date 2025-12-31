-- String utilities for testing
-- Provides trim, split, startsWith, endsWith functions

---@class StringUtils
local M = {}

---Trim whitespace from both ends of a string
---@param s string String to trim
---@return string Trimmed string
function M.trim(s)
  return s:match("^%s*(.-)%s*$")
end

---Split a string by delimiter
---@param s string String to split
---@param delimiter? string Delimiter pattern (default whitespace)
---@return string[] Array of parts
function M.split(s, delimiter)
  delimiter = delimiter or "%s"
  local result = {}
  for match in (s .. delimiter):gmatch("(.-)" .. delimiter) do
    result[#result + 1] = match
  end
  return result
end

---Check if string starts with prefix
---@param s string String to check
---@param prefix string Prefix to look for
---@return boolean True if s starts with prefix
function M.startsWith(s, prefix)
  return s:sub(1, #prefix) == prefix
end

---Check if string ends with suffix
---@param s string String to check
---@param suffix string Suffix to look for
---@return boolean True if s ends with suffix
function M.endsWith(s, suffix)
  return suffix == "" or s:sub(-#suffix) == suffix
end

return M
