-- Fields tests for schema_editor package
-- Tests field type builders

local string_field = require("fields/string")
local number_field = require("fields/number")
local boolean_field = require("fields/boolean")
local array_field = require("fields/array")

describe("Schema Field Builders", function()
  describe("string_field", function()
    it.each({
      { name = "email", required = nil, min = nil, max = nil, expectedRequired = false },
      { name = "username", required = true, min = 3, max = 20, expectedRequired = true },
    })("should create string field $name", function(testCase)
      local result = string_field(testCase.name, testCase.required, testCase.min, testCase.max)
      expect(result.type).toBe("string")
      expect(result.name).toBe(testCase.name)
      expect(result.required).toBe(testCase.expectedRequired)
      if testCase.min then
        expect(result.minLength).toBe(testCase.min)
      end
      if testCase.max then
        expect(result.maxLength).toBe(testCase.max)
      end
    end)
  end)

  describe("number_field", function()
    it.each({
      { name = "age", required = nil, min = nil, max = nil, expectedRequired = false },
      { name = "quantity", required = true, min = 0, max = 1000, expectedRequired = true },
    })("should create number field $name", function(testCase)
      local result = number_field(testCase.name, testCase.required, testCase.min, testCase.max)
      expect(result.type).toBe("number")
      expect(result.name).toBe(testCase.name)
      expect(result.required).toBe(testCase.expectedRequired)
      if testCase.min then
        expect(result.min).toBe(testCase.min)
      end
      if testCase.max then
        expect(result.max).toBe(testCase.max)
      end
    end)
  end)

  describe("boolean_field", function()
    it.each({
      { name = "active", required = nil, default = nil, expectedRequired = false },
      { name = "verified", required = true, default = false, expectedRequired = true },
    })("should create boolean field $name", function(testCase)
      local result = boolean_field(testCase.name, testCase.required, testCase.default)
      expect(result.type).toBe("boolean")
      expect(result.name).toBe(testCase.name)
      expect(result.required).toBe(testCase.expectedRequired)
    end)
  end)

  describe("array_field", function()
    it.each({
      { name = "tags", itemType = "string", required = nil, expectedRequired = false },
      { name = "ids", itemType = "number", required = true, expectedRequired = true },
    })("should create array field $name of $itemType", function(testCase)
      local result = array_field(testCase.name, testCase.itemType, testCase.required)
      expect(result.type).toBe("array")
      expect(result.name).toBe(testCase.name)
      expect(result.items.type).toBe(testCase.itemType)
      expect(result.required).toBe(testCase.expectedRequired)
    end)
  end)
end)
