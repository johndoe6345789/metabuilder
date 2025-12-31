-- Spy utilities for testing
-- Allows spying on existing object methods

local mock_fn = require("mock_fn")

---@class SpyModule
local M = {}

---Create a spy on an existing object method
---@param obj table Object containing the method
---@param methodName string Name of method to spy on
---@return MockFunction Spy with tracking methods and mockRestore
function M.spyOn(obj, methodName)
  local original = obj[methodName]
  if type(original) ~= "function" then
    error("Cannot spy on non-function: " .. methodName)
  end
  
  local spy = mock_fn.fn(original)
  
  -- Add restore functionality
  local meta = getmetatable(spy).__index
  local originalRestore = meta.mockRestore
  meta.mockRestore = function()
    obj[methodName] = original
    originalRestore()
  end
  
  -- Replace the method
  obj[methodName] = function(...)
    return spy(...)
  end
  
  return spy
end

return M
