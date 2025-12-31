-- Function matcher implementations
local utils = require("assert_utils")

---@class FunctionMatchers
local M = {}

---toThrow - expects a function to throw
---@param actual any The actual value (must be function)
---@param expectedMessage string|nil Optional expected error message
---@param negated boolean Whether assertion is negated
function M.toThrow(actual, expectedMessage, negated)
    if type(actual) ~= "function" then
        error("toThrow can only be used with functions")
    end

    local success, err = pcall(actual)
    local pass = not success

    if pass and expectedMessage then
        local errMsg = type(err) == "table" and err.message or tostring(err)
        pass = string.find(errMsg, expectedMessage, 1, true) ~= nil
    end

    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected function not to throw"
            or "Expected function to throw" .. (expectedMessage and " with message: " .. expectedMessage or "")
        error(utils.assertionError(msg, expectedMessage or "error", success and "no error" or err))
    end
    return true
end

return M
