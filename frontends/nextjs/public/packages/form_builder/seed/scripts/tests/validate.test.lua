-- Validation Tests
-- Parameterized tests for form validation rules

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")

local cases = require("tests.validate.cases")
local required = require("validate.required")
local email = require("validate.email")
local min_length = require("validate.min_length")
local max_length = require("validate.max_length")
local pattern = require("validate.pattern")

describe("form validation", function()

  describe("required", function()
    it("should create required rule with default message", function()
      local rule = required()
      expect(rule.type).toBe("required")
      expect(rule.message).toBe("This field is required")
    end)

    it_each(cases.required.customMessage, "should use custom message: '$message'", function(case)
      local rule = required(case.message)
      expect(rule.message).toBe(case.message)
    end)
  end)

  describe("email", function()
    it("should create email rule with pattern", function()
      local rule = email()
      expect(rule.type).toBe("email")
      expect(rule.pattern).toBeTruthy()
    end)

    it_each(cases.email.validPatterns, "pattern should match '$email'", function(case)
      local rule = email()
      local matches = string.match(case.email, rule.pattern)
      expect(matches).toBeTruthy()
    end)

    it_each(cases.email.invalidPatterns, "pattern should reject '$email'", function(case)
      local rule = email()
      local matches = string.match(case.email, rule.pattern)
      expect(matches).toBe(nil)
    end)

    it_each(cases.email.customMessage, "should use custom message: '$message'", function(case)
      local rule = email(case.message)
      expect(rule.message).toBe(case.message)
    end)
  end)

  describe("min_length", function()
    it_each(cases.minLength.rules, "should create rule for min $length chars", function(case)
      local rule = min_length(case.length)
      expect(rule.type).toBe("minLength")
      expect(rule.value).toBe(case.length)
    end)

    it("should generate default message with length", function()
      local rule = min_length(8)
      expect(rule.message).toContain("8")
    end)

    it_each(cases.minLength.customMessage, "should use custom message", function(case)
      local rule = min_length(case.length, case.message)
      expect(rule.message).toBe(case.message)
    end)
  end)

  describe("max_length", function()
    it_each(cases.maxLength.rules, "should create rule for max $length chars", function(case)
      local rule = max_length(case.length)
      expect(rule.type).toBe("maxLength")
      expect(rule.value).toBe(case.length)
    end)

    it("should generate default message with length", function()
      local rule = max_length(100)
      expect(rule.message).toContain("100")
    end)
  end)

  describe("pattern", function()
    it_each(cases.pattern.rules, "should create rule with pattern: $name", function(case)
      local rule = pattern(case.regex, case.message)
      expect(rule.type).toBe("pattern")
      expect(rule.pattern).toBe(case.regex)
    end)

    it_each(cases.pattern.matchTests, "pattern '$regex' should match '$value'", function(case)
      local matches = string.match(case.value, case.regex)
      expect(matches ~= nil).toBe(case.expected)
    end)
  end)

end)

return {
  name = "validate.test",
  description = "Tests for form validation rules"
}
