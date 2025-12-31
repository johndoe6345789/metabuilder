-- Assertion utilities - helper functions
-- Provides stringify, deepEqual, assertionError for matchers

---@class AssertionUtils
local M = {}

---Get type with better nil handling
---@param value any Value to check type of
---@return string The type name
function M.getType(value)
  if value == nil then return "nil" end
  return type(value)
end

---Convert any value to a string representation for error messages
---@param value any Value to stringify
---@return string String representation
function M.stringify(value)
  local t = type(value)
  if t == "string" then
    return '"' .. value .. '"'
  elseif t == "table" then
    local parts = {}
    for k, v in pairs(value) do
      parts[#parts + 1] = tostring(k) .. "=" .. M.stringify(v)
    end
    return "{" .. table.concat(parts, ", ") .. "}"
  elseif t == "nil" then
    return "nil"
  else
    return tostring(value)
  end
end

---Deep equality check for tables
---@param a any First value
---@param b any Second value
---@return boolean True if deeply equal
function M.deepEqual(a, b)
  if type(a) ~= type(b) then return false end
  if type(a) ~= "table" then return a == b end
  
  -- Check all keys in a exist in b with same values
  for k, v in pairs(a) do
    if not M.deepEqual(v, b[k]) then return false end
  end
  
  -- Check all keys in b exist in a
  for k, _ in pairs(b) do
    if a[k] == nil then return false end
  end
  
  return true
end

---@class AssertionError
---@field type string Always "AssertionError"
---@field message string Error message
---@field expected any Expected value
---@field actual any Actual value

---Create an assertion error object
---@param message string Error message
---@param expected any Expected value
---@param actual any Actual value
---@return AssertionError
function M.assertionError(message, expected, actual)
  return {
    type = "AssertionError",
    message = message,
    expected = expected,
    actual = actual
  }
end

return M
