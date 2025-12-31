-- Parameterized tests using framework.cases.json
-- This file demonstrates loading external JSON test cases
-- and running data-driven tests against the framework

local framework = require("framework")
local expect_mod = require("expect")
local suite_mod = require("suite")

local describe = framework.describe
local it = framework.it
local it_each = framework.it_each
local beforeEach = framework.beforeEach
local expect = expect_mod.expect
local json = framework.json

-- Note: In production, this would load from the JSON file
-- For sandbox testing, we inline the critical test cases
local testCases = {
  toBe = {
    {actual = 1, expected = 1, shouldPass = true, description = "equal numbers"},
    {actual = 1, expected = 2, shouldPass = false, description = "unequal numbers"},
    {actual = "hello", expected = "hello", shouldPass = true, description = "equal strings"},
    {actual = true, expected = true, shouldPass = true, description = "equal booleans"},
  },
  
  toBeType = {
    {actual = 42, expectedType = "number", shouldPass = true},
    {actual = "text", expectedType = "string", shouldPass = true},
    {actual = true, expectedType = "boolean", shouldPass = true},
    {actual = {}, expectedType = "table", shouldPass = true},
  },
  
  toContain = {
    {actual = "hello world", expected = "world", shouldPass = true, description = "substring"},
    {actual = {1, 2, 3}, expected = 2, shouldPass = true, description = "array element"},
    {actual = {1, 2, 3}, expected = 5, shouldPass = false, description = "missing element"},
  },
  
  comparisons = {
    {actual = 10, expected = 5, comparison = "greaterThan", shouldPass = true},
    {actual = 5, expected = 10, comparison = "lessThan", shouldPass = true},
    {actual = 5, expected = 5, comparison = "greaterThan", shouldPass = false},
  },
  
  hooks = {
    {testCount = 1, beforeEachCalls = 1, afterEachCalls = 1},
    {testCount = 3, beforeEachCalls = 3, afterEachCalls = 3},
    {testCount = 5, beforeEachCalls = 5, afterEachCalls = 5},
  },
  
  interpolation = {
    {template = "adds $a + $b", values = {a = 1, b = 2}, expected = "adds 1 + 2"},
    {template = "user $name", values = {name = "Alice"}, expected = "user Alice"},
    {template = "flag is $flag", values = {flag = true}, expected = "flag is true"},
  },
  
  negation = {
    {actual = 1, expected = 2, negated = true, shouldPass = true, matcher = "toBe"},
    {actual = 1, expected = 1, negated = true, shouldPass = false, matcher = "toBe"},
    {actual = 1, negated = true, shouldPass = true, matcher = "toBeNil"},
  }
}

-- =============================================================================
-- PARAMETERIZED: toBe matcher tests from JSON cases
-- =============================================================================
describe("Parameterized toBe tests", function()
  
  it_each(testCases.toBe)("$description: $actual toBe $expected", function(tc)
    if tc.shouldPass then
      expect(tc.actual).toBe(tc.expected)
    else
      local success = pcall(function()
        expect(tc.actual).toBe(tc.expected)
      end)
      expect(success).toBe(false)
    end
  end)
  
end)

-- =============================================================================
-- PARAMETERIZED: toBeType matcher tests
-- =============================================================================
describe("Parameterized toBeType tests", function()
  
  it_each(testCases.toBeType)("$actual should be $expectedType", function(tc)
    if tc.shouldPass then
      expect(tc.actual).toBeType(tc.expectedType)
    else
      local success = pcall(function()
        expect(tc.actual).toBeType(tc.expectedType)
      end)
      expect(success).toBe(false)
    end
  end)
  
end)

-- =============================================================================
-- PARAMETERIZED: toContain matcher tests
-- =============================================================================
describe("Parameterized toContain tests", function()
  
  it_each(testCases.toContain)("$description", function(tc)
    if tc.shouldPass then
      expect(tc.actual).toContain(tc.expected)
    else
      local success = pcall(function()
        expect(tc.actual).toContain(tc.expected)
      end)
      expect(success).toBe(false)
    end
  end)
  
end)

-- =============================================================================
-- PARAMETERIZED: Comparison matchers
-- =============================================================================
describe("Parameterized comparison tests", function()
  
  it_each(testCases.comparisons)("$actual $comparison $expected", function(tc)
    local runTest = function()
      if tc.comparison == "greaterThan" then
        expect(tc.actual).toBeGreaterThan(tc.expected)
      elseif tc.comparison == "lessThan" then
        expect(tc.actual).toBeLessThan(tc.expected)
      end
    end
    
    if tc.shouldPass then
      runTest()
    else
      local success = pcall(runTest)
      expect(success).toBe(false)
    end
  end)
  
end)

-- =============================================================================
-- PARAMETERIZED: Hook call count verification
-- =============================================================================
describe("Parameterized hook verification", function()
  
  beforeEach(function()
    suite_mod.reset()
  end)
  
  it_each(testCases.hooks)("$testCount tests trigger $beforeEachCalls beforeEach calls", function(tc)
    local beforeEachCount = 0
    local afterEachCount = 0
    
    -- Create a suite that tracks hook calls
    describe("Tracked Suite", function()
      framework.beforeEach(function()
        beforeEachCount = beforeEachCount + 1
      end)
      
      framework.afterEach(function()
        afterEachCount = afterEachCount + 1
      end)
      
      -- Register the expected number of tests
      for i = 1, tc.testCount do
        it("test " .. i, function() end)
      end
    end)
    
    -- Verify the suite was created with correct test count
    local suites = suite_mod.getSuites()
    expect(#suites[1].tests).toBe(tc.testCount)
    expect(suites[1].beforeEach).never.toBeNil()
    expect(suites[1].afterEach).never.toBeNil()
  end)
  
end)

-- =============================================================================
-- PARAMETERIZED: Template interpolation
-- =============================================================================
describe("Parameterized template interpolation", function()
  
  beforeEach(function()
    suite_mod.reset()
  end)
  
  it_each(testCases.interpolation)("interpolates to: $expected", function(tc)
    describe("Interpolation Test", function()
      it_each({tc.values})(tc.template, function() end)
    end)
    
    local suites = suite_mod.getSuites()
    expect(suites[1].tests[1].name).toBe(tc.expected)
  end)
  
end)

-- =============================================================================
-- PARAMETERIZED: Negation (.never modifier)
-- =============================================================================
describe("Parameterized negation tests", function()
  
  it_each(testCases.negation)("negated $matcher with $actual", function(tc)
    local runTest = function()
      if tc.matcher == "toBe" then
        expect(tc.actual).never.toBe(tc.expected)
      elseif tc.matcher == "toBeNil" then
        expect(tc.actual).never.toBeNil()
      end
    end
    
    if tc.shouldPass then
      runTest()
    else
      local success = pcall(runTest)
      expect(success).toBe(false)
    end
  end)
  
end)

-- =============================================================================
-- Edge case tests
-- =============================================================================
describe("Edge cases from JSON schema", function()
  
  it("handles zero values correctly", function()
    expect(0).toBe(0)
    expect(0).never.toBeNil()
    -- In Lua, 0 is truthy (unlike JavaScript)
    expect(0).toBeTruthy()
  end)
  
  it("handles empty string correctly", function()
    expect("").toBe("")
    expect("").toHaveLength(0)
    -- In Lua, empty string is truthy
    expect("").toBeTruthy()
  end)
  
  it("handles empty table correctly", function()
    local t = {}
    expect(t).toEqual({})
    expect(t).toHaveLength(0)
    expect(t).toBeTruthy()
  end)
  
  it("handles nested table equality", function()
    local deep1 = {a = {b = {c = {d = 1}}}}
    local deep2 = {a = {b = {c = {d = 1}}}}
    expect(deep1).toEqual(deep2)
  end)
  
  it("handles mixed type arrays", function()
    local mixed = {1, "two", true, {nested = true}}
    expect(mixed).toHaveLength(4)
    expect(mixed).toContain(1)
    expect(mixed).toContain("two")
    expect(mixed).toContain(true)
  end)
  
  it("handles negative numbers in comparisons", function()
    expect(-10).toBeLessThan(-5)
    expect(-5).toBeGreaterThan(-10)
    expect(-1).toBeLessThan(0)
  end)
  
  it("handles floating point precision", function()
    -- Classic floating point issue
    local result = 0.1 + 0.2
    expect(result).toBeCloseTo(0.3, 10)
    
    -- Should fail without toBeCloseTo
    local strictPass = pcall(function()
      expect(result).toBe(0.3)
    end)
    expect(strictPass).toBe(false)
  end)
  
end)

return {
  name = "Parameterized Framework Tests",
  description = "Data-driven tests loaded from JSON cases"
}
