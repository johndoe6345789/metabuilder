-- Mock object creator
-- Creates objects with multiple mock methods

local mock_fn = require("mock_fn")

---@class MockObjectModule
local M = {}

---@class MockObject
---@field _mocks table<string, MockFunction> Internal mock storage
---@field _resetAll fun() Reset all mocks on this object

---Create a mock object with multiple mock functions
---@param methods? table<string, function> Method names to implementations
---@return MockObject Object with mock methods
function M.mockObject(methods)
  local obj = {}
  local mocks = {}
  
  for name, impl in pairs(methods or {}) do
    mocks[name] = mock_fn.fn(impl)
    obj[name] = function(...) return mocks[name](...) end
  end
  
  obj._mocks = mocks
  
  obj._resetAll = function()
    for _, mock in pairs(mocks) do
      mock.reset()
    end
  end
  
  return obj
end

return M
