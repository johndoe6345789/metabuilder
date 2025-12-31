-- Table utilities for testing
-- Provides clone, merge, keys, values, size functions

---@class TableUtils
local M = {}

---Deep clone a table
---@param t table Table to clone
---@return table Cloned table
function M.clone(t)
  if type(t) ~= "table" then return t end
  local copy = {}
  for k, v in pairs(t) do
    copy[k] = M.clone(v)
  end
  return setmetatable(copy, getmetatable(t))
end

---Merge multiple tables into one
---@vararg table Tables to merge (later tables override earlier)
---@return table Merged table
function M.merge(...)
  local result = {}
  for _, t in ipairs({...}) do
    if type(t) == "table" then
      for k, v in pairs(t) do
        result[k] = v
      end
    end
  end
  return result
end

---Get all keys from a table
---@param t table Source table
---@return any[] Array of keys
function M.keys(t)
  local keys = {}
  for k in pairs(t) do
    keys[#keys + 1] = k
  end
  return keys
end

---Get all values from a table
---@param t table Source table
---@return any[] Array of values
function M.values(t)
  local values = {}
  for _, v in pairs(t) do
    values[#values + 1] = v
  end
  return values
end

---Get the number of entries in a table (including non-array keys)
---@param t table Table to count
---@return number Number of key-value pairs
function M.size(t)
  local count = 0
  for _ in pairs(t) do
    count = count + 1
  end
  return count
end

return M
