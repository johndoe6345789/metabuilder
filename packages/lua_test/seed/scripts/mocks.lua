-- Mock and spy utilities for testing
-- Allows tracking function calls and replacing implementations

local M = {}

-- Create a mock function
function M.fn(implementation)
  local mock = {
    calls = {},
    results = {},
    implementation = implementation
  }
  
  -- The callable mock function
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
  
  -- Attach mock metadata to the function via a metatable
  return setmetatable({}, {
    __call = function(_, ...) return callable(...) end,
    __index = {
      -- Get call count
      getCallCount = function()
        return #mock.calls
      end,
      
      -- Check if called
      wasCalled = function()
        return #mock.calls > 0
      end,
      
      -- Check if called with specific args
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
      
      -- Get specific call args
      getCall = function(index)
        return mock.calls[index]
      end,
      
      -- Get last call args
      getLastCall = function()
        return mock.calls[#mock.calls]
      end,
      
      -- Get all calls
      getCalls = function()
        return mock.calls
      end,
      
      -- Get all results
      getResults = function()
        return mock.results
      end,
      
      -- Clear call history
      reset = function()
        mock.calls = {}
        mock.results = {}
      end,
      
      -- Set return value
      mockReturnValue = function(value)
        mock.implementation = function() return value end
      end,
      
      -- Set return values in sequence
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
      
      -- Set implementation
      mockImplementation = function(fn)
        mock.implementation = fn
      end,
      
      -- Restore original (for spies)
      mockRestore = function()
        mock.implementation = nil
        mock.calls = {}
        mock.results = {}
      end
    }
  })
end

-- Create a spy on an existing object method
function M.spyOn(obj, methodName)
  local original = obj[methodName]
  if type(original) ~= "function" then
    error("Cannot spy on non-function: " .. methodName)
  end
  
  local spy = M.fn(original)
  
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

-- Create a mock object with multiple mock functions
function M.mockObject(methods)
  local obj = {}
  local mocks = {}
  
  for name, impl in pairs(methods or {}) do
    mocks[name] = M.fn(impl)
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

-- Timer mocks for testing time-dependent code
function M.useFakeTimers()
  local timers = {
    now = 0,
    scheduled = {}
  }
  
  return {
    -- Get current fake time
    now = function()
      return timers.now
    end,
    
    -- Schedule a callback (like setTimeout)
    schedule = function(callback, delay)
      local id = #timers.scheduled + 1
      timers.scheduled[id] = {
        callback = callback,
        time = timers.now + delay,
        id = id
      }
      return id
    end,
    
    -- Cancel a scheduled callback
    cancel = function(id)
      timers.scheduled[id] = nil
    end,
    
    -- Advance time and run scheduled callbacks
    advance = function(ms)
      local targetTime = timers.now + ms
      
      -- Sort by scheduled time
      local pending = {}
      for _, timer in pairs(timers.scheduled) do
        if timer.time <= targetTime then
          pending[#pending + 1] = timer
        end
      end
      
      table.sort(pending, function(a, b) return a.time < b.time end)
      
      -- Run each callback at its scheduled time
      for _, timer in ipairs(pending) do
        timers.now = timer.time
        timer.callback()
        timers.scheduled[timer.id] = nil
      end
      
      timers.now = targetTime
    end,
    
    -- Run all pending timers
    runAll = function()
      while next(timers.scheduled) do
        local nextTimer
        local nextTime = math.huge
        
        for id, timer in pairs(timers.scheduled) do
          if timer.time < nextTime then
            nextTime = timer.time
            nextTimer = timer
          end
        end
        
        if nextTimer then
          timers.now = nextTimer.time
          nextTimer.callback()
          timers.scheduled[nextTimer.id] = nil
        end
      end
    end,
    
    -- Reset timers
    reset = function()
      timers.now = 0
      timers.scheduled = {}
    end
  }
end

return M
