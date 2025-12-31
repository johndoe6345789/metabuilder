-- Collection matcher implementations (arrays, strings, tables)
local utils = require("assert_utils")

---@class CollectionMatchers
local M = {}

---toContain - for strings and tables
---@param actual any The actual value
---@param expected any The expected value to find
---@param negated boolean Whether assertion is negated
function M.toContain(actual, expected, negated)
    local pass = false

    if type(actual) == "string" and type(expected) == "string" then
        pass = string.find(actual, expected, 1, true) ~= nil
    elseif type(actual) == "table" then
        for _, v in pairs(actual) do
            if utils.deepEqual(v, expected) then
                pass = true
                break
            end
        end
    end

    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected " .. utils.stringify(actual) .. " not to contain " .. utils.stringify(expected)
            or "Expected " .. utils.stringify(actual) .. " to contain " .. utils.stringify(expected)
        error(utils.assertionError(msg, expected, actual))
    end
    return true
end

---toHaveLength
---@param actual any The actual value
---@param expectedLength number The expected length
---@param negated boolean Whether assertion is negated
function M.toHaveLength(actual, expectedLength, negated)
    local actualLength
    if type(actual) == "string" then
        actualLength = #actual
    elseif type(actual) == "table" then
        actualLength = #actual
    else
        error("toHaveLength can only be used with strings or tables")
    end

    local pass = actualLength == expectedLength
    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected length not to be " .. expectedLength .. ", got " .. actualLength
            or "Expected length to be " .. expectedLength .. ", got " .. actualLength
        error(utils.assertionError(msg, expectedLength, actualLength))
    end
    return true
end

---toHaveProperty
---@param actual any The actual value
---@param key any The property key
---@param value any Optional expected value
---@param negated boolean Whether assertion is negated
function M.toHaveProperty(actual, key, value, negated)
    if type(actual) ~= "table" then
        error("toHaveProperty can only be used with tables")
    end

    local pass = actual[key] ~= nil
    if pass and value ~= nil then
        pass = utils.deepEqual(actual[key], value)
    end

    if negated then pass = not pass end

    if not pass then
        local msg = negated
            and "Expected table not to have property " .. utils.stringify(key)
            or "Expected table to have property " .. utils.stringify(key) .. (value and " with value " .. utils.stringify(value) or "")
        error(utils.assertionError(msg, value, actual[key]))
    end
    return true
end

return M
