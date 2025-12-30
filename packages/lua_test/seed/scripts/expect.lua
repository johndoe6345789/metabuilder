-- Expect wrapper with chainable matchers
-- Provides expect(value).toBe(), .toEqual(), etc.

local equality = require("matchers.equality")
local truthiness = require("matchers.truthiness")
local types = require("matchers.types")
local collections = require("matchers.collections")
local numbers = require("matchers.numbers")
local strings = require("matchers.strings")
local functions = require("matchers.functions")

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

  -- Equality matchers
  function expectation.toBe(expected)
    return equality.toBe(actual, expected, expectation.negated)
  end

  function expectation.toEqual(expected)
    return equality.toEqual(actual, expected, expectation.negated)
  end

  -- Truthiness matchers
  function expectation.toBeNil()
    return truthiness.toBeNil(actual, expectation.negated)
  end

  function expectation.toBeTruthy()
    return truthiness.toBeTruthy(actual, expectation.negated)
  end

  function expectation.toBeFalsy()
    return truthiness.toBeFalsy(actual, expectation.negated)
  end

  -- Type matchers
  function expectation.toBeType(expectedType)
    return types.toBeType(actual, expectedType, expectation.negated)
  end

  -- Collection matchers
  function expectation.toContain(expected)
    return collections.toContain(actual, expected, expectation.negated)
  end

  function expectation.toHaveLength(expectedLength)
    return collections.toHaveLength(actual, expectedLength, expectation.negated)
  end

  function expectation.toHaveProperty(key, value)
    return collections.toHaveProperty(actual, key, value, expectation.negated)
  end

  -- Number matchers
  function expectation.toBeGreaterThan(expected)
    return numbers.toBeGreaterThan(actual, expected, expectation.negated)
  end

  function expectation.toBeLessThan(expected)
    return numbers.toBeLessThan(actual, expected, expectation.negated)
  end

  function expectation.toBeCloseTo(expected, precision)
    return numbers.toBeCloseTo(actual, expected, precision, expectation.negated)
  end

  -- String matchers
  function expectation.toMatch(pattern)
    return strings.toMatch(actual, pattern, expectation.negated)
  end

  -- Function matchers
  function expectation.toThrow(expectedMessage)
    return functions.toThrow(actual, expectedMessage, expectation.negated)
  end

  return expectation
end

return M
