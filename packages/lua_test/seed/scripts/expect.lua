-- Expect wrapper with chainable matchers
-- Provides expect(value).toBe(), .toEqual(), etc.

local utils = require("assert_utils")

---@class ExpectModule
local M = {}

---@class Expectation
---@field actual any The value being tested
---@field negated boolean Whether assertion is negated (.never)
---@field never Expectation Negated expectation accessor
---@field toBe fun(expected: any): boolean Strict equality check
---@field toEqual fun(expected: any): boolean Deep equality check
---@field toBeNil fun(): boolean Check if nil
---@field toBeTruthy fun(): boolean Check if truthy
---@field toBeFalsy fun(): boolean Check if falsy
---@field toBeType fun(expectedType: string): boolean Check type
---@field toContain fun(expected: any): boolean Check contains (string/table)
---@field toHaveLength fun(expectedLength: number): boolean Check length
---@field toBeGreaterThan fun(expected: number): boolean Numeric comparison
---@field toBeLessThan fun(expected: number): boolean Numeric comparison
---@field toBeCloseTo fun(expected: number, precision?: number): boolean Float comparison
---@field toMatch fun(pattern: string): boolean Pattern matching
---@field toThrow fun(expectedMessage?: string): boolean Function throws check
---@field toHaveProperty fun(key: any, value?: any): boolean Property check

---Create an expectation wrapper with chainable matchers
---@param actual any The value to test
---@return Expectation Expectation object with matchers
function M.expect(actual)
  local expectation = {
    actual = actual,
    negated = false
  }
  
  -- Not modifier
  expectation.never = setmetatable({}, {
    __index = function(_, key)
      expectation.negated = true
      return expectation[key]
    end
  })
  
  -- toBe - strict equality
  function expectation.toBe(expected)
    local pass = actual == expected
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated 
        and "Expected " .. utils.stringify(actual) .. " not to be " .. utils.stringify(expected)
        or "Expected " .. utils.stringify(actual) .. " to be " .. utils.stringify(expected)
      error(utils.assertionError(msg, expected, actual))
    end
    return true
  end
  
  -- toEqual - deep equality
  function expectation.toEqual(expected)
    local pass = utils.deepEqual(actual, expected)
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected values not to be deeply equal"
        or "Expected values to be deeply equal"
      error(utils.assertionError(msg, expected, actual))
    end
    return true
  end
  
  -- toBeNil
  function expectation.toBeNil()
    local pass = actual == nil
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. utils.stringify(actual) .. " not to be nil"
        or "Expected " .. utils.stringify(actual) .. " to be nil"
      error(utils.assertionError(msg, nil, actual))
    end
    return true
  end
  
  -- toBeTruthy
  function expectation.toBeTruthy()
    local pass = actual and true or false
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. utils.stringify(actual) .. " not to be truthy"
        or "Expected " .. utils.stringify(actual) .. " to be truthy"
      error(utils.assertionError(msg, "truthy", actual))
    end
    return true
  end
  
  -- toBeFalsy
  function expectation.toBeFalsy()
    local pass = not actual
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. utils.stringify(actual) .. " not to be falsy"
        or "Expected " .. utils.stringify(actual) .. " to be falsy"
      error(utils.assertionError(msg, "falsy", actual))
    end
    return true
  end
  
  -- toBeType
  function expectation.toBeType(expectedType)
    local actualType = utils.getType(actual)
    local pass = actualType == expectedType
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected type not to be " .. expectedType .. ", got " .. actualType
        or "Expected type to be " .. expectedType .. ", got " .. actualType
      error(utils.assertionError(msg, expectedType, actualType))
    end
    return true
  end
  
  -- toContain - for strings and tables
  function expectation.toContain(expected)
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
    
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. utils.stringify(actual) .. " not to contain " .. utils.stringify(expected)
        or "Expected " .. utils.stringify(actual) .. " to contain " .. utils.stringify(expected)
      error(utils.assertionError(msg, expected, actual))
    end
    return true
  end
  
  -- toHaveLength
  function expectation.toHaveLength(expectedLength)
    local actualLength
    if type(actual) == "string" then
      actualLength = #actual
    elseif type(actual) == "table" then
      actualLength = #actual
    else
      error("toHaveLength can only be used with strings or tables")
    end
    
    local pass = actualLength == expectedLength
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected length not to be " .. expectedLength .. ", got " .. actualLength
        or "Expected length to be " .. expectedLength .. ", got " .. actualLength
      error(utils.assertionError(msg, expectedLength, actualLength))
    end
    return true
  end
  
  -- toBeGreaterThan
  function expectation.toBeGreaterThan(expected)
    local pass = actual > expected
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. utils.stringify(actual) .. " not to be greater than " .. utils.stringify(expected)
        or "Expected " .. utils.stringify(actual) .. " to be greater than " .. utils.stringify(expected)
      error(utils.assertionError(msg, "> " .. expected, actual))
    end
    return true
  end
  
  -- toBeLessThan
  function expectation.toBeLessThan(expected)
    local pass = actual < expected
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. utils.stringify(actual) .. " not to be less than " .. utils.stringify(expected)
        or "Expected " .. utils.stringify(actual) .. " to be less than " .. utils.stringify(expected)
      error(utils.assertionError(msg, "< " .. expected, actual))
    end
    return true
  end
  
  -- toBeCloseTo - for floating point comparison
  function expectation.toBeCloseTo(expected, precision)
    precision = precision or 2
    local diff = math.abs(actual - expected)
    local pass = diff < (10 ^ -precision) / 2
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. actual .. " not to be close to " .. expected
        or "Expected " .. actual .. " to be close to " .. expected .. " (diff: " .. diff .. ")"
      error(utils.assertionError(msg, expected, actual))
    end
    return true
  end
  
  -- toMatch - regex pattern matching
  function expectation.toMatch(pattern)
    if type(actual) ~= "string" then
      error("toMatch can only be used with strings")
    end
    
    local pass = string.match(actual, pattern) ~= nil
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. utils.stringify(actual) .. " not to match pattern " .. pattern
        or "Expected " .. utils.stringify(actual) .. " to match pattern " .. pattern
      error(utils.assertionError(msg, pattern, actual))
    end
    return true
  end
  
  -- toThrow - expects a function to throw
  function expectation.toThrow(expectedMessage)
    if type(actual) ~= "function" then
      error("toThrow can only be used with functions")
    end
    
    local success, err = pcall(actual)
    local pass = not success
    
    if pass and expectedMessage then
      local errMsg = type(err) == "table" and err.message or tostring(err)
      pass = string.find(errMsg, expectedMessage, 1, true) ~= nil
    end
    
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected function not to throw"
        or "Expected function to throw" .. (expectedMessage and " with message: " .. expectedMessage or "")
      error(utils.assertionError(msg, expectedMessage or "error", success and "no error" or err))
    end
    return true
  end
  
  -- toHaveProperty
  function expectation.toHaveProperty(key, value)
    if type(actual) ~= "table" then
      error("toHaveProperty can only be used with tables")
    end
    
    local pass = actual[key] ~= nil
    if pass and value ~= nil then
      pass = utils.deepEqual(actual[key], value)
    end
    
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected table not to have property " .. utils.stringify(key)
        or "Expected table to have property " .. utils.stringify(key) .. (value and " with value " .. utils.stringify(value) or "")
      error(utils.assertionError(msg, value, actual[key]))
    end
    return true
  end
  
  return expectation
end

return M
