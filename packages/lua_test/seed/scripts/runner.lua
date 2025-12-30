-- Test runner facade
-- Re-exports all runner modules for backward compatibility
--
-- Split into focused modules:
--   test_status.lua - Test status constants (PASSED, FAILED, etc.)
--   run_test.lua    - Single test execution (runTest)
--   run_suite.lua   - Suite execution (runSuite, runAll)
--   reporter.lua    - Report formatting (formatReport, formatJSON)

local test_status = require("test_status")
local run_test = require("run_test")
local run_suite = require("run_suite")
local reporter = require("reporter")

---@class RunnerModule
local M = {}

-- Re-export status constants
M.STATUS = test_status

-- Re-export test runner
M.runTest = run_test.runTest

-- Re-export suite runner
M.runSuite = run_suite.runSuite
M.runAll = run_suite.runAll

-- Re-export reporters
M.formatReport = reporter.formatReport
M.formatJSON = reporter.formatJSON

return M
