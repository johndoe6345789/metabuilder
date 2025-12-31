-- Numeric comparison matcher implementations
local utils = require("assert_utils")

---@class NumberMatchers
local M = {}

---toBeGreaterThan
---@param actual any The actual value
---@param expected number The expected value
---@param negated boolean Whether assertion is negated
function M.toBeGreaterThan(actual, expected, negated)
    local pass = actual > expected
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. utils.stringify(actual) .. " not to be greater than " .. utils.stringify(expected)
            or "Expected " .. utils.stringify(actual) .. " to be greater than " .. utils.stringify(expected)
        error(utils.assertionError(msg, "> " .. expected, actual))
    end
    return true
end

---toBeLessThan
---@param actual any The actual value
---@param expected number The expected value
---@param negated boolean Whether assertion is negated
function M.toBeLessThan(actual, expected, negated)
    local pass = actual < expected
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. utils.stringify(actual) .. " not to be less than " .. utils.stringify(expected)
            or "Expected " .. utils.stringify(actual) .. " to be less than " .. utils.stringify(expected)
        error(utils.assertionError(msg, "< " .. expected, actual))
    end
    return true
end

---toBeCloseTo - for floating point comparison
---@param actual any The actual value
---@param expected number The expected value
---@param precision number Decimal precision (default 2)
---@param negated boolean Whether assertion is negated
function M.toBeCloseTo(actual, expected, precision, negated)
    precision = precision or 2
    local diff = math.abs(actual - expected)
    local pass = diff < (10 ^ -precision) / 2
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. actual .. " not to be close to " .. expected
            or "Expected " .. actual .. " to be close to " .. expected .. " (diff: " .. diff .. ")"
        error(utils.assertionError(msg, expected, actual))
    end
    return true
end

return M
