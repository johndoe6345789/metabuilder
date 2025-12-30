-- Test context utilities
-- Provides context builder for sharing state in tests

local table_utils = require("table_utils")

---@class TestContextModule
local M = {}

---@class TestContext
---@field get fun(key: string): any Get a context value
---@field set fun(key: string, value: any) Set a context value
---@field with fun(overrides: table): table Get context merged with overrides
---@field reset fun() Reset context to initial state
---@field getAll fun(): table Get a clone of all context values

---Create a test context for sharing state
---@param initial? table Initial context values
---@return TestContext Context object with get/set/with/reset methods
function M.createContext(initial)
  local ctx = initial or {}
  
  return {
    ---Get a context value by key
    ---@param key string Key to look up
    ---@return any Value at key
    get = function(key)
      return ctx[key]
    end,
    
    ---Set a context value
    ---@param key string Key to set
    ---@param value any Value to store
    set = function(key, value)
      ctx[key] = value
    end,
    
    ---Get context merged with overrides
    ---@param overrides table Values to merge
    ---@return table Merged context
    with = function(overrides)
      return table_utils.merge(ctx, overrides)
    end,
    
    ---Reset context to initial state
    reset = function()
      ctx = initial and table_utils.clone(initial) or {}
    end,
    
    ---Get a clone of all context values
    ---@return table Clone of context
    getAll = function()
      return table_utils.clone(ctx)
    end
  }
end

return M
