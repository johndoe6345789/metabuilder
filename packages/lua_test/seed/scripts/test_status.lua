-- Test status constants
-- Defines the possible states for test results

---@class TestStatus
local M = {}

---@alias TestStatusValue "passed" | "failed" | "skipped" | "pending"

---Test passed successfully
M.PASSED = "passed"

---Test failed with an error
M.FAILED = "failed"

---Test was skipped
M.SKIPPED = "skipped"

---Test is pending execution
M.PENDING = "pending"

return M
