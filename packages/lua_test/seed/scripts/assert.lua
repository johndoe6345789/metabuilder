-- Standalone assertion functions
-- Provides assertTrue, assertFalse, assertEqual, etc.

local utils = require("assert_utils")

---@class AssertModule
local M = {}

---Assert that a value is truthy
---@param value any Value to check
---@param message? string Optional custom error message
function M.assertTrue(value, message)
  if not value then
    error(utils.assertionError(message or "Expected true", true, value))
  end
end

---Assert that a value is falsy
---@param value any Value to check
---@param message? string Optional custom error message
function M.assertFalse(value, message)
  if value then
    error(utils.assertionError(message or "Expected false", false, value))
  end
end

---Assert that two values are equal (strict)
---@param actual any Actual value
---@param expected any Expected value
---@param message? string Optional custom error message
function M.assertEqual(actual, expected, message)
  if actual ~= expected then
    error(utils.assertionError(message or "Values not equal", expected, actual))
  end
end

---Assert that two values are not equal
---@param actual any Actual value
---@param expected any Value that actual should not equal
---@param message? string Optional custom error message
function M.assertNotEqual(actual, expected, message)
  if actual == expected then
    error(utils.assertionError(message or "Values should not be equal", "not " .. utils.stringify(expected), actual))
  end
end

---Assert that a value is nil
---@param value any Value to check
---@param message? string Optional custom error message
function M.assertNil(value, message)
  if value ~= nil then
    error(utils.assertionError(message or "Expected nil", nil, value))
  end
end

---Assert that a value is not nil
---@param value any Value to check
---@param message? string Optional custom error message
function M.assertNotNil(value, message)
  if value == nil then
    error(utils.assertionError(message or "Expected not nil", "not nil", nil))
  end
end

---Explicitly fail a test
---@param message? string Optional failure message
function M.fail(message)
  error(utils.assertionError(message or "Test failed", nil, nil))
end

return M
