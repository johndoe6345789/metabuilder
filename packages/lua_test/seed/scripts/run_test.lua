-- Single test runner
-- Executes individual tests with hooks

local STATUS = require("test_status")

---@class TestRunnerModule
local M = {}

---@class TestResult
---@field name string Test name
---@field status TestStatusValue Test status
---@field error string|nil Error message if failed
---@field expected any|nil Expected value for assertion errors
---@field actual any|nil Actual value for assertion errors
---@field duration number Test duration in milliseconds

---@class TestHooks
---@field beforeEach function|nil Hook run before test
---@field afterEach function|nil Hook run after test

---Run a single test with hooks
---@param test Test Test definition
---@param hooks TestHooks Lifecycle hooks
---@return TestResult Test execution result
function M.runTest(test, hooks)
  local result = {
    name = test.name,
    status = STATUS.PENDING,
    error = nil,
    duration = 0
  }
  
  if test.skipped then
    result.status = STATUS.SKIPPED
    return result
  end
  
  local startTime = os.clock()
  
  -- Run beforeEach hook
  if hooks.beforeEach then
    local success, err = pcall(hooks.beforeEach)
    if not success then
      result.status = STATUS.FAILED
      result.error = "beforeEach failed: " .. tostring(err)
      result.duration = (os.clock() - startTime) * 1000
      return result
    end
  end
  
  -- Run the test
  local success, err = pcall(test.fn)
  
  -- Run afterEach hook
  if hooks.afterEach then
    pcall(hooks.afterEach)
  end
  
  result.duration = (os.clock() - startTime) * 1000
  
  if success then
    result.status = STATUS.PASSED
  else
    result.status = STATUS.FAILED
    if type(err) == "table" and err.type == "AssertionError" then
      result.error = err.message
      result.expected = err.expected
      result.actual = err.actual
    else
      result.error = tostring(err)
    end
  end
  
  return result
end

return M
