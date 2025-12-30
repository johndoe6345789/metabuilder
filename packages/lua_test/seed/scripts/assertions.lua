-- Assertion functions facade
-- Re-exports all assertion modules for backward compatibility
--
-- Split into focused modules:
--   assert_utils.lua - Helper functions (stringify, deepEqual, assertionError)
--   expect.lua       - expect() with chainable matchers
--   assert.lua       - Standalone assertions (assertTrue, assertEqual, etc.)

local expect_module = require("expect")
local assert_module = require("assert")

---@class AssertionsModule
local M = {}

-- Re-export expect
M.expect = expect_module.expect

-- Re-export standalone assertions
M.assertTrue = assert_module.assertTrue
M.assertFalse = assert_module.assertFalse
M.assertEqual = assert_module.assertEqual
M.assertNotEqual = assert_module.assertNotEqual
M.assertNil = assert_module.assertNil
M.assertNotNil = assert_module.assertNotNil
M.fail = assert_module.fail

return M
