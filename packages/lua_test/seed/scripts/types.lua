-- Shared type definitions for the test framework
-- Central location for all @class and @alias definitions

---@class TestConfig
---@field timeout number Test timeout in milliseconds
---@field verbose boolean Enable verbose output
---@field stopOnFirstFailure boolean Stop suite on first test failure
---@field filter string|nil Filter tests by name pattern

---@class TestSuite
---@field name string Suite name
---@field tests Test[] Array of tests in this suite
---@field beforeAll function|nil Hook run once before all tests
---@field afterAll function|nil Hook run once after all tests
---@field beforeEach function|nil Hook run before each test
---@field afterEach function|nil Hook run after each test
---@field nested TestSuite[] Nested test suites
---@field parent TestSuite|nil Parent suite if nested

---@class Test
---@field name string Test name
---@field fn function Test function to execute
---@field status string Test status (pending, passed, failed, skipped)
---@field error string|nil Error message if failed
---@field duration number Test duration in milliseconds
---@field skipped boolean Whether test is skipped
---@field only boolean|nil If true, only this test runs

---@alias ParameterizedTestFactory fun(nameTemplate: string, fn: fun(testCase: table)): nil

-- This module only provides type definitions for LuaLS
-- No runtime exports needed
return {}
