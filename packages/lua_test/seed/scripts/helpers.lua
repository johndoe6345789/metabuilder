-- Test helper utilities facade
-- Re-exports all helper modules for backward compatibility
--
-- Split into focused modules:
--   test_data.lua    - Test data generation (generateTestData)
--   wait.lua         - Async wait utilities (waitFor)
--   snapshot.lua     - Snapshot testing (createSnapshot, serialize)
--   table_utils.lua  - Table utilities (clone, merge, keys, values, size)
--   string_utils.lua - String utilities (trim, split, startsWith, endsWith)
--   context.lua      - Test context builder (createContext)

local test_data = require("test_data")
local wait = require("wait")
local snapshot = require("snapshot")
local table_utils = require("table_utils")
local string_utils = require("string_utils")
local context = require("context")

---@class HelpersModule
local M = {}

-- Re-export test data generation
M.generateTestData = test_data.generateTestData

-- Re-export parameterized helper
---Create parameterized test cases
---@param cases table[] Array of test case objects
---@param testFn fun(testCase: table) Test function receiving each case
---@return function Runner function that executes all cases
function M.parameterized(cases, testFn)
  return function()
    for _, testCase in ipairs(cases) do
      testFn(testCase)
    end
  end
end

-- Re-export wait utilities
M.waitFor = wait.waitFor

-- Re-export snapshot utilities
M.createSnapshot = snapshot.createSnapshot
M.serialize = snapshot.serialize

-- Re-export table utilities
M.table = table_utils

-- Re-export string utilities
M.string = string_utils

-- Re-export context builder
M.createContext = context.createContext

-- Assertion shortcuts for common patterns
---Assert that a function throws an error
---@param fn function Function expected to throw
---@param expectedMessage? string Optional message to check for
---@return any The error that was thrown
function M.assertThrows(fn, expectedMessage)
  local success, err = pcall(fn)
  if success then
    error("Expected function to throw, but it didn't")
  end
  if expectedMessage then
    local errStr = type(err) == "table" and err.message or tostring(err)
    if not string.find(errStr, expectedMessage, 1, true) then
      error("Expected error to contain: " .. expectedMessage .. ", got: " .. errStr)
    end
  end
  return err
end

---Assert that a function does not throw
---@param fn function Function that should not throw
function M.assertDoesNotThrow(fn)
  local success, err = pcall(fn)
  if not success then
    error("Expected function not to throw, but got: " .. tostring(err))
  end
end

return M
