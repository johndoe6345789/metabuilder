-- Test lifecycle hooks
-- Provides beforeAll, afterAll, beforeEach, afterEach

local suite = require("suite")

---@class HooksModule
local M = {}

---Setup hook run once before all tests in a suite
---@param fn function Setup function
function M.beforeAll(fn)
  local currentSuite = suite.getCurrentSuite()
  if currentSuite then
    currentSuite.beforeAll = fn
  end
end

---Teardown hook run once after all tests in a suite
---@param fn function Teardown function
function M.afterAll(fn)
  local currentSuite = suite.getCurrentSuite()
  if currentSuite then
    currentSuite.afterAll = fn
  end
end

---Setup hook run before each test in a suite
---@param fn function Setup function
function M.beforeEach(fn)
  local currentSuite = suite.getCurrentSuite()
  if currentSuite then
    currentSuite.beforeEach = fn
  end
end

---Teardown hook run after each test in a suite
---@param fn function Teardown function
function M.afterEach(fn)
  local currentSuite = suite.getCurrentSuite()
  if currentSuite then
    currentSuite.afterEach = fn
  end
end

return M
