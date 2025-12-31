-- Mock function creator
-- Creates trackable mock functions with call history

---@class MockFn
local M = {}

---@class MockFunction
---@field getCallCount fun(): number Get number of times called
---@field wasCalled fun(): boolean Check if function was called
---@field wasCalledWith fun(...): boolean Check if called with specific args
---@field getCall fun(index: number): any[] Get args from specific call
---@field getLastCall fun(): any[] Get args from last call
---@field getCalls fun(): any[][] Get all call args
---@field getResults fun(): any[][] Get all return values
---@field reset fun() Clear call history
---@field mockReturnValue fun(value: any) Set return value
---@field mockReturnValueOnce fun(value: any) Set one-time return value
---@field mockImplementation fun(fn: function) Set implementation
---@field mockRestore fun() Restore to original state

---Create a mock function that tracks calls
---@param implementation? function Optional implementation
---@return MockFunction Callable mock with tracking methods
function M.fn(implementation)
  local mock = {
    calls = {},
    results = {},
    implementation = implementation
  }
  
  local callable = function(...)
    local args = {...}
    mock.calls[#mock.calls + 1] = args
    
    local result
    if mock.implementation then
      result = {mock.implementation(...)}
    else
      result = {}
    end
    
    mock.results[#mock.results + 1] = result
    return table.unpack(result)
  end
  
  return setmetatable({}, {
    __call = function(_, ...) return callable(...) end,
    __index = {
      getCallCount = function()
        return #mock.calls
      end,
      
      wasCalled = function()
        return #mock.calls > 0
      end,
      
      wasCalledWith = function(...)
        local expectedArgs = {...}
        for _, callArgs in ipairs(mock.calls) do
          local match = true
          for i, expected in ipairs(expectedArgs) do
            if callArgs[i] ~= expected then
              match = false
              break
            end
          end
          if match then return true end
        end
        return false
      end,
      
      getCall = function(index)
        return mock.calls[index]
      end,
      
      getLastCall = function()
        return mock.calls[#mock.calls]
      end,
      
      getCalls = function()
        return mock.calls
      end,
      
      getResults = function()
        return mock.results
      end,
      
      reset = function()
        mock.calls = {}
        mock.results = {}
      end,
      
      mockReturnValue = function(value)
        mock.implementation = function() return value end
      end,
      
      mockReturnValueOnce = function(value)
        local originalImpl = mock.implementation
        local called = false
        mock.implementation = function(...)
          if not called then
            called = true
            return value
          elseif originalImpl then
            return originalImpl(...)
          end
        end
      end,
      
      mockImplementation = function(fn)
        mock.implementation = fn
      end,
      
      mockRestore = function()
        mock.implementation = nil
        mock.calls = {}
        mock.results = {}
      end
    }
  })
end

return M
