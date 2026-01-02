-- Fake timer utilities for testing
-- Allows controlling time in tests

---@class FakeTimersModule
local M = {}

---@class FakeTimers
---@field now fun(): number Get current fake time
---@field schedule fun(callback: function, delay: number): number Schedule callback
---@field cancel fun(id: number) Cancel scheduled callback
---@field advance fun(ms: number) Advance time by milliseconds
---@field runAll fun() Run all pending timers
---@field reset fun() Reset timer state

---Create a fake timer system for testing time-dependent code
---@return FakeTimers Timer control object
function M.useFakeTimers()
  local timers = {
    now = 0,
    scheduled = {}
  }
  
  return {
    ---Get current fake time
    ---@return number Current fake timestamp
    now = function()
      return timers.now
    end,
    
    ---Schedule a callback (like setTimeout)
    ---@param callback function Function to call
    ---@param delay number Delay in milliseconds
    ---@return number Timer ID for cancellation
    schedule = function(callback, delay)
      local id = #timers.scheduled + 1
      timers.scheduled[id] = {
        callback = callback,
        time = timers.now + delay,
        id = id
      }
      return id
    end,
    
    ---Cancel a scheduled callback
    ---@param id number Timer ID to cancel
    cancel = function(id)
      timers.scheduled[id] = nil
    end,
    
    ---Advance time and run scheduled callbacks
    ---@param ms number Milliseconds to advance
    advance = function(ms)
      local targetTime = timers.now + ms
      
      local pending = {}
      for _, timer in pairs(timers.scheduled) do
        if timer.time <= targetTime then
          pending[#pending + 1] = timer
        end
      end
      
      table.sort(pending, function(a, b) return a.time < b.time end)
      
      for _, timer in ipairs(pending) do
        timers.now = timer.time
        timer.callback()
        timers.scheduled[timer.id] = nil
      end
      
      timers.now = targetTime
    end,
    
    ---Run all pending timers
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
    
    ---Reset timer state
    reset = function()
      timers.now = 0
      timers.scheduled = {}
    end
  }
end

return M
