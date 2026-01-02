-- Equality matcher implementations
local utils = require("assert_utils")

---@class EqualityMatchers
local M = {}

---toBe - strict equality
---@param actual any The actual value
---@param expected any The expected value
---@param negated boolean Whether assertion is negated
function M.toBe(actual, expected, negated)
    local pass = actual == expected
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. utils.stringify(actual) .. " not to be " .. utils.stringify(expected)
            or "Expected " .. utils.stringify(actual) .. " to be " .. utils.stringify(expected)
        error(utils.assertionError(msg, expected, actual))
    end
    return true
end

---toEqual - deep equality
---@param actual any The actual value
---@param expected any The expected value
---@param negated boolean Whether assertion is negated
function M.toEqual(actual, expected, negated)
    local pass = utils.deepEqual(actual, expected)
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected values not to be deeply equal"
            or "Expected values to be deeply equal"
        error(utils.assertionError(msg, expected, actual))
    end
    return true
end

return M
