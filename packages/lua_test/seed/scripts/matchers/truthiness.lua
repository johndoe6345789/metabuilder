-- Truthiness and nil matcher implementations
local utils = require("assert_utils")

---@class TruthinessMatchers
local M = {}

---toBeNil
---@param actual any The actual value
---@param negated boolean Whether assertion is negated
function M.toBeNil(actual, negated)
    local pass = actual == nil
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. utils.stringify(actual) .. " not to be nil"
            or "Expected " .. utils.stringify(actual) .. " to be nil"
        error(utils.assertionError(msg, nil, actual))
    end
    return true
end

---toBeTruthy
---@param actual any The actual value
---@param negated boolean Whether assertion is negated
function M.toBeTruthy(actual, negated)
    local pass = actual and true or false
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. utils.stringify(actual) .. " not to be truthy"
            or "Expected " .. utils.stringify(actual) .. " to be truthy"
        error(utils.assertionError(msg, "truthy", actual))
    end
    return true
end

---toBeFalsy
---@param actual any The actual value
---@param negated boolean Whether assertion is negated
function M.toBeFalsy(actual, negated)
    local pass = not actual
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. utils.stringify(actual) .. " not to be falsy"
            or "Expected " .. utils.stringify(actual) .. " to be falsy"
        error(utils.assertionError(msg, "falsy", actual))
    end
    return true
end

return M
