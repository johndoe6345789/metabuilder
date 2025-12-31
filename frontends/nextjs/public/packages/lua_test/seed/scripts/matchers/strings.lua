-- String matcher implementations
local utils = require("assert_utils")

---@class StringMatchers
local M = {}

---toMatch - regex pattern matching
---@param actual any The actual value
---@param pattern string The pattern to match
---@param negated boolean Whether assertion is negated
function M.toMatch(actual, pattern, negated)
    if type(actual) ~= "string" then
        error("toMatch can only be used with strings")
    end

    local pass = string.match(actual, pattern) ~= nil
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. utils.stringify(actual) .. " not to match pattern " .. pattern
            or "Expected " .. utils.stringify(actual) .. " to match pattern " .. pattern
        error(utils.assertionError(msg, pattern, actual))
    end
    return true
end

return M
