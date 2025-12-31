-- Type checking matcher implementations
local utils = require("assert_utils")

---@class TypeMatchers
local M = {}

---toBeType
---@param actual any The actual value
---@param expectedType string The expected type
---@param negated boolean Whether assertion is negated
function M.toBeType(actual, expectedType, negated)
    local actualType = utils.getType(actual)
    local pass = actualType == expectedType
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected type not to be " .. expectedType .. ", got " .. actualType
            or "Expected type to be " .. expectedType .. ", got " .. actualType
        error(utils.assertionError(msg, expectedType, actualType))
    end
    return true
end

return M
