-- Wait utilities for async-like testing
-- Provides waitFor condition polling

---@class WaitModule
local M = {}

---@class WaitForOptions
---@field timeout? number Timeout in milliseconds (default 1000)
---@field interval? number Polling interval in ms (default 10)
---@field throwOnTimeout? boolean Whether to throw on timeout (default true)

---Wait for a condition to become true
---@param condition fun(): boolean Function returning true when condition is met
---@param options? WaitForOptions Configuration options
---@return boolean True if condition was met, false if timed out (when throwOnTimeout=false)
function M.waitFor(condition, options)
  options = options or {}
  local timeout = options.timeout or 1000
  local interval = options.interval or 10
  local startTime = os.clock() * 1000
  
  while (os.clock() * 1000 - startTime) < timeout do
    if condition() then
      return true
    end
    -- Note: In sandbox, we can't actually sleep, but this provides the pattern
  end
  
  if options.throwOnTimeout ~= false then
    error("waitFor timed out after " .. timeout .. "ms")
  end
  
  return false
end

return M
