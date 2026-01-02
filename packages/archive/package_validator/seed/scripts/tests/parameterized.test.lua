-- Parameterized tests using cases.json
local metadata_schema = require("metadata_schema")
local component_schema = require("component_schema")

describe("Parameterized Metadata Validation", function()
  local cases = load_cases("cases.json")

  -- Test valid metadata cases
  describe("Valid Metadata Cases", function()
    for _, case in ipairs(cases.valid_metadata_cases) do
      it("should pass: " .. case.name, function()
        local valid, errors = metadata_schema.validate_metadata(case.data)
        expect(valid).toBe(case.expected)
        if case.expected then
          expect(#errors).toBe(0)
        end
      end)
    end
  end)

  -- Test invalid metadata cases
  describe("Invalid Metadata Cases", function()
    for _, case in ipairs(cases.invalid_metadata_cases) do
      it("should fail: " .. case.name, function()
        local valid, errors = metadata_schema.validate_metadata(case.data)
        expect(valid).toBe(case.expected)
        if not case.expected then
          expect(#errors).toBeGreaterThan(0)
        end
      end)
    end
  end)
end)

describe("Parameterized Component Validation", function()
  local cases = load_cases("cases.json")

  -- Test valid component cases
  describe("Valid Component Cases", function()
    for _, case in ipairs(cases.valid_component_cases) do
      it("should pass: " .. case.name, function()
        local errors = component_schema.validate_component(case.data)
        expect(#errors).toBe(0)
      end)
    end
  end)

  -- Test invalid component cases
  describe("Invalid Component Cases", function()
    for _, case in ipairs(cases.invalid_component_cases) do
      it("should fail: " .. case.name, function()
        local errors = component_schema.validate_component(case.data)
        expect(#errors).toBeGreaterThan(0)
      end)
    end
  end)
end)
