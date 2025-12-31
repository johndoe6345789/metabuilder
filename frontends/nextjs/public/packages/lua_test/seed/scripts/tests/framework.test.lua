-- Meta-tests for the lua_test framework itself
-- Tests that describe(), it(), expect() and hooks work correctly
--
-- This file validates the test framework by using it to test itself.
-- A passing run proves the core functions are operational.

local framework = require("framework")
local expect_mod = require("expect")
local suite_mod = require("suite")

local describe = framework.describe
local it = framework.it
local it_each = framework.it_each
local xit = framework.xit
local fit = framework.fit
local beforeAll = framework.beforeAll
local afterAll = framework.afterAll
local beforeEach = framework.beforeEach
local afterEach = framework.afterEach
local expect = expect_mod.expect

-- Load parameterized test cases
local json = framework.json
local casesJson = [[
{
  "describe_tests": [
    {"name": "empty suite", "testCount": 0},
    {"name": "single test", "testCount": 1},
    {"name": "multiple tests", "testCount": 3}
  ],
  "expect_assertions": [
    {"value": 1, "expected": 1, "matcher": "toBe", "shouldPass": true},
    {"value": 1, "expected": 2, "matcher": "toBe", "shouldPass": false},
    {"value": "hello", "expected": "hello", "matcher": "toBe", "shouldPass": true},
    {"value": true, "expected": true, "matcher": "toBe", "shouldPass": true},
    {"value": null, "expected": null, "matcher": "toBeNil", "shouldPass": true}
  ],
  "hook_sequences": [
    {"hook": "beforeAll", "expectedCalls": 1},
    {"hook": "afterAll", "expectedCalls": 1},
    {"hook": "beforeEach", "expectedCalls": 3},
    {"hook": "afterEach", "expectedCalls": 3}
  ],
  "type_checks": [
    {"value": 42, "expectedType": "number"},
    {"value": "text", "expectedType": "string"},
    {"value": true, "expectedType": "boolean"},
    {"value": {}, "expectedType": "table"},
    {"value": null, "expectedType": "nil"}
  ]
}
]]
local cases = json.decode(casesJson)

-- =============================================================================
-- TEST SUITE: describe() function
-- =============================================================================
describe("describe() function", function()
  
  beforeEach(function()
    suite_mod.reset()
  end)
  
  afterEach(function()
    suite_mod.reset()
  end)
  
  it("should create a test suite with the given name", function()
    local testSuite = describe("My Test Suite", function() end)
    expect(testSuite.name).toBe("My Test Suite")
  end)
  
  it("should register the suite with the framework", function()
    describe("Registered Suite", function() end)
    local suites = suite_mod.getSuites()
    expect(#suites).toBe(1)
    expect(suites[1].name).toBe("Registered Suite")
  end)
  
  it("should support nested describe blocks", function()
    describe("Parent Suite", function()
      describe("Child Suite", function()
        it("nested test", function() end)
      end)
    end)
    
    local suites = suite_mod.getSuites()
    expect(#suites).toBe(1)
    expect(suites[1].name).toBe("Parent Suite")
    expect(#suites[1].nested).toBe(1)
    expect(suites[1].nested[1].name).toBe("Child Suite")
  end)
  
  it("should set parent reference on nested suites", function()
    local parentSuite = describe("Parent", function()
      describe("Child", function() end)
    end)
    
    local childSuite = parentSuite.nested[1]
    expect(childSuite.parent).toBe(parentSuite)
  end)
  
  it("should initialize empty arrays for tests and hooks", function()
    local testSuite = describe("Empty Suite", function() end)
    expect(type(testSuite.tests)).toBe("table")
    expect(#testSuite.tests).toBe(0)
    expect(type(testSuite.nested)).toBe("table")
    expect(#testSuite.nested).toBe(0)
  end)
  
end)

-- =============================================================================
-- TEST SUITE: it() function
-- =============================================================================
describe("it() function", function()
  
  beforeEach(function()
    suite_mod.reset()
  end)
  
  it("should create a test with the given name", function()
    describe("Suite", function()
      local test = it("my test", function() end)
      expect(test.name).toBe("my test")
    end)
  end)
  
  it("should store the test function", function()
    local testFn = function() end
    describe("Suite", function()
      local test = it("test with fn", testFn)
      expect(test.fn).toBe(testFn)
    end)
  end)
  
  it("should set initial status to pending", function()
    describe("Suite", function()
      local test = it("pending test", function() end)
      expect(test.status).toBe("pending")
    end)
  end)
  
  it("should add test to current suite's tests array", function()
    local suiteRef
    describe("Suite", function()
      suiteRef = suite_mod.getCurrentSuite()
      it("test 1", function() end)
      it("test 2", function() end)
    end)
    
    local suites = suite_mod.getSuites()
    expect(#suites[1].tests).toBe(2)
  end)
  
  it("should error when called outside describe block", function()
    suite_mod.reset()
    suite_mod.setCurrentSuite(nil)
    
    local success, err = pcall(function()
      it("orphan test", function() end)
    end)
    
    expect(success).toBe(false)
    expect(type(err)).toBe("string")
  end)
  
end)

-- =============================================================================
-- TEST SUITE: it_each() parameterized tests
-- =============================================================================
describe("it_each() parameterized tests", function()
  
  beforeEach(function()
    suite_mod.reset()
  end)
  
  it("should create multiple tests from cases array", function()
    local testCases = {
      {input = 1, expected = 2},
      {input = 2, expected = 4},
      {input = 3, expected = 6}
    }
    
    describe("Parameterized Suite", function()
      it_each(testCases)("doubles $input to $expected", function(tc)
        expect(tc.input * 2).toBe(tc.expected)
      end)
    end)
    
    local suites = suite_mod.getSuites()
    expect(#suites[1].tests).toBe(3)
  end)
  
  it("should interpolate $fieldName in test names", function()
    local testCases = {
      {name = "Alice", age = 30}
    }
    
    describe("Name Interpolation", function()
      it_each(testCases)("user $name is $age years old", function(tc) end)
    end)
    
    local suites = suite_mod.getSuites()
    expect(suites[1].tests[1].name).toBe("user Alice is 30 years old")
  end)
  
  it("should handle table values in interpolation", function()
    local testCases = {
      {data = {nested = true}}
    }
    
    describe("Table Interpolation", function()
      it_each(testCases)("handles $data", function(tc) end)
    end)
    
    local suites = suite_mod.getSuites()
    expect(suites[1].tests[1].name).toBe("handles [table]")
  end)
  
end)

-- =============================================================================
-- TEST SUITE: xit() and fit() focused/skipped tests
-- =============================================================================
describe("xit() and fit() test modifiers", function()
  
  beforeEach(function()
    suite_mod.reset()
  end)
  
  it("xit should mark test as skipped", function()
    describe("Skipped Suite", function()
      local test = xit("skipped test", function() end)
      expect(test.skipped).toBe(true)
      expect(test.status).toBe("skipped")
    end)
  end)
  
  it("fit should mark test with only flag", function()
    describe("Focused Suite", function()
      local test = fit("focused test", function() end)
      expect(test.only).toBe(true)
    end)
  end)
  
  it("regular it should not have only flag", function()
    describe("Normal Suite", function()
      local test = it("normal test", function() end)
      expect(test.only).toBeNil()
    end)
  end)
  
end)

-- =============================================================================
-- TEST SUITE: expect() matchers
-- =============================================================================
describe("expect() matchers", function()
  
  describe("toBe - strict equality", function()
    
    it("should pass for equal primitives", function()
      expect(1).toBe(1)
      expect("hello").toBe("hello")
      expect(true).toBe(true)
    end)
    
    it("should fail for unequal primitives", function()
      local success = pcall(function()
        expect(1).toBe(2)
      end)
      expect(success).toBe(false)
    end)
    
    it("should support .never modifier", function()
      expect(1).never.toBe(2)
      expect("a").never.toBe("b")
    end)
    
    it("should fail when .never and values are equal", function()
      local success = pcall(function()
        expect(1).never.toBe(1)
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toEqual - deep equality", function()
    
    it("should pass for deeply equal tables", function()
      expect({a = 1, b = 2}).toEqual({a = 1, b = 2})
    end)
    
    it("should pass for nested tables", function()
      expect({x = {y = {z = 1}}}).toEqual({x = {y = {z = 1}}})
    end)
    
    it("should fail for different tables", function()
      local success = pcall(function()
        expect({a = 1}).toEqual({a = 2})
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toBeNil", function()
    
    it("should pass for nil values", function()
      local x = nil
      expect(x).toBeNil()
    end)
    
    it("should fail for non-nil values", function()
      local success = pcall(function()
        expect(1).toBeNil()
      end)
      expect(success).toBe(false)
    end)
    
    it("should support .never modifier", function()
      expect(1).never.toBeNil()
      expect("").never.toBeNil()
    end)
    
  end)
  
  describe("toBeTruthy and toBeFalsy", function()
    
    it("toBeTruthy should pass for truthy values", function()
      expect(true).toBeTruthy()
      expect(1).toBeTruthy()
      expect("text").toBeTruthy()
      expect({}).toBeTruthy()
    end)
    
    it("toBeFalsy should pass for falsy values", function()
      expect(false).toBeFalsy()
      expect(nil).toBeFalsy()
    end)
    
    it("toBeTruthy should fail for falsy values", function()
      local success = pcall(function()
        expect(false).toBeTruthy()
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toBeType", function()
    
    it_each(cases.type_checks)("should detect $expectedType type", function(tc)
      expect(tc.value).toBeType(tc.expectedType)
    end)
    
    it("should fail for wrong type", function()
      local success = pcall(function()
        expect(42).toBeType("string")
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toContain", function()
    
    it("should find substring in string", function()
      expect("hello world").toContain("world")
    end)
    
    it("should find element in array", function()
      expect({1, 2, 3}).toContain(2)
    end)
    
    it("should fail when element not found", function()
      local success = pcall(function()
        expect({1, 2, 3}).toContain(5)
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toHaveLength", function()
    
    it("should check string length", function()
      expect("hello").toHaveLength(5)
    end)
    
    it("should check array length", function()
      expect({1, 2, 3}).toHaveLength(3)
    end)
    
    it("should fail for wrong length", function()
      local success = pcall(function()
        expect({1, 2}).toHaveLength(5)
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toBeGreaterThan and toBeLessThan", function()
    
    it("toBeGreaterThan should pass for greater values", function()
      expect(10).toBeGreaterThan(5)
    end)
    
    it("toBeLessThan should pass for lesser values", function()
      expect(5).toBeLessThan(10)
    end)
    
    it("toBeGreaterThan should fail for lesser values", function()
      local success = pcall(function()
        expect(5).toBeGreaterThan(10)
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toBeCloseTo", function()
    
    it("should pass for close floating point values", function()
      expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
    end)
    
    it("should fail for values outside precision", function()
      local success = pcall(function()
        expect(0.1).toBeCloseTo(0.2, 1)
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toMatch", function()
    
    it("should match Lua patterns", function()
      expect("hello123").toMatch("%d+")
      expect("test@example.com").toMatch("@.*%.com")
    end)
    
    it("should fail when pattern not found", function()
      local success = pcall(function()
        expect("hello").toMatch("%d+")
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toThrow", function()
    
    it("should pass when function throws", function()
      expect(function()
        error("boom")
      end).toThrow()
    end)
    
    it("should pass when function throws with expected message", function()
      expect(function()
        error("specific error")
      end).toThrow("specific")
    end)
    
    it("should fail when function does not throw", function()
      local success = pcall(function()
        expect(function()
          return 1
        end).toThrow()
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
  describe("toHaveProperty", function()
    
    it("should pass when property exists", function()
      expect({name = "Alice"}).toHaveProperty("name")
    end)
    
    it("should pass when property has expected value", function()
      expect({age = 30}).toHaveProperty("age", 30)
    end)
    
    it("should fail when property does not exist", function()
      local success = pcall(function()
        expect({}).toHaveProperty("missing")
      end)
      expect(success).toBe(false)
    end)
    
  end)
  
end)

-- =============================================================================
-- TEST SUITE: Lifecycle hooks
-- =============================================================================
describe("Lifecycle hooks", function()
  
  local hookLog = {}
  
  beforeEach(function()
    suite_mod.reset()
    hookLog = {}
  end)
  
  it("beforeAll should be set on suite", function()
    local hookFn = function() end
    describe("Hook Suite", function()
      beforeAll(hookFn)
    end)
    
    local suites = suite_mod.getSuites()
    expect(suites[1].beforeAll).toBe(hookFn)
  end)
  
  it("afterAll should be set on suite", function()
    local hookFn = function() end
    describe("Hook Suite", function()
      afterAll(hookFn)
    end)
    
    local suites = suite_mod.getSuites()
    expect(suites[1].afterAll).toBe(hookFn)
  end)
  
  it("beforeEach should be set on suite", function()
    local hookFn = function() end
    describe("Hook Suite", function()
      beforeEach(hookFn)
    end)
    
    local suites = suite_mod.getSuites()
    expect(suites[1].beforeEach).toBe(hookFn)
  end)
  
  it("afterEach should be set on suite", function()
    local hookFn = function() end
    describe("Hook Suite", function()
      afterEach(hookFn)
    end)
    
    local suites = suite_mod.getSuites()
    expect(suites[1].afterEach).toBe(hookFn)
  end)
  
  it("hooks should be nil by default", function()
    describe("No Hooks Suite", function()
      it("empty test", function() end)
    end)
    
    local suites = suite_mod.getSuites()
    expect(suites[1].beforeAll).toBeNil()
    expect(suites[1].afterAll).toBeNil()
    expect(suites[1].beforeEach).toBeNil()
    expect(suites[1].afterEach).toBeNil()
  end)
  
end)

-- =============================================================================
-- TEST SUITE: Suite configuration
-- =============================================================================
describe("Suite configuration", function()
  
  beforeEach(function()
    suite_mod.reset()
  end)
  
  it("should have default timeout of 5000ms", function()
    local config = suite_mod.getConfig()
    expect(config.timeout).toBe(5000)
  end)
  
  it("should have verbose enabled by default", function()
    local config = suite_mod.getConfig()
    expect(config.verbose).toBe(true)
  end)
  
  it("should have stopOnFirstFailure disabled by default", function()
    local config = suite_mod.getConfig()
    expect(config.stopOnFirstFailure).toBe(false)
  end)
  
  it("configure should update settings", function()
    suite_mod.configure({timeout = 10000, verbose = false})
    local config = suite_mod.getConfig()
    expect(config.timeout).toBe(10000)
    expect(config.verbose).toBe(false)
    
    -- Reset to defaults for other tests
    suite_mod.configure({timeout = 5000, verbose = true})
  end)
  
end)

-- =============================================================================
-- TEST SUITE: JSON test case loading
-- =============================================================================
describe("JSON test case loading", function()
  
  it("should parse JSON string", function()
    local jsonStr = '{"name": "test", "value": 123}'
    local data = json.decode(jsonStr)
    expect(data.name).toBe("test")
    expect(data.value).toBe(123)
  end)
  
  it("should load cases with path navigation", function()
    local jsonStr = '{"tests": {"login": [{"user": "alice"}]}}'
    local loginCases = framework.load_cases(jsonStr, "tests.login")
    expect(#loginCases).toBe(1)
    expect(loginCases[1].user).toBe("alice")
  end)
  
  it("should error on invalid path", function()
    local jsonStr = '{"a": {"b": 1}}'
    local success = pcall(function()
      framework.load_cases(jsonStr, "a.c.d")
    end)
    expect(success).toBe(false)
  end)
  
  it("should return empty array for missing data", function()
    local jsonStr = '{"empty": null}'
    local cases2 = framework.load_cases(jsonStr, "empty")
    expect(type(cases2)).toBe("table")
    expect(#cases2).toBe(0)
  end)
  
end)

-- =============================================================================
-- TEST SUITE: Suite reset functionality
-- =============================================================================
describe("Suite reset functionality", function()
  
  it("reset should clear all suites", function()
    describe("Suite 1", function() end)
    describe("Suite 2", function() end)
    
    expect(#suite_mod.getSuites()).toBe(2)
    
    suite_mod.reset()
    
    expect(#suite_mod.getSuites()).toBe(0)
  end)
  
  it("reset should clear current suite", function()
    describe("Active Suite", function()
      -- During this callback, currentSuite is set
    end)
    
    suite_mod.reset()
    expect(suite_mod.getCurrentSuite()).toBeNil()
  end)
  
end)

-- =============================================================================
-- META-TEST: Framework can test itself
-- =============================================================================
describe("Meta-test: Framework self-validation", function()
  
  it("framework exports all expected functions", function()
    expect(type(framework.describe)).toBe("function")
    expect(type(framework.it)).toBe("function")
    expect(type(framework.it_each)).toBe("function")
    expect(type(framework.xit)).toBe("function")
    expect(type(framework.fit)).toBe("function")
    expect(type(framework.beforeAll)).toBe("function")
    expect(type(framework.afterAll)).toBe("function")
    expect(type(framework.beforeEach)).toBe("function")
    expect(type(framework.afterEach)).toBe("function")
    expect(type(framework.load_cases)).toBe("function")
    expect(type(framework.reset)).toBe("function")
  end)
  
  it("expect module exports expect function", function()
    expect(type(expect_mod.expect)).toBe("function")
  end)
  
  it("expectation object has all matchers", function()
    local e = expect(1)
    expect(type(e.toBe)).toBe("function")
    expect(type(e.toEqual)).toBe("function")
    expect(type(e.toBeNil)).toBe("function")
    expect(type(e.toBeTruthy)).toBe("function")
    expect(type(e.toBeFalsy)).toBe("function")
    expect(type(e.toBeType)).toBe("function")
    expect(type(e.toContain)).toBe("function")
    expect(type(e.toHaveLength)).toBe("function")
    expect(type(e.toBeGreaterThan)).toBe("function")
    expect(type(e.toBeLessThan)).toBe("function")
    expect(type(e.toBeCloseTo)).toBe("function")
    expect(type(e.toMatch)).toBe("function")
    expect(type(e.toThrow)).toBe("function")
    expect(type(e.toHaveProperty)).toBe("function")
  end)
  
  it("this test file executes without errors", function()
    -- If we reach here, the framework successfully loaded and executed
    expect(true).toBe(true)
  end)
  
end)

return {
  name = "Framework Meta-Tests",
  description = "Tests the lua_test framework using itself"
}
