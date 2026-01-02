-- Tests for JSON editor utilities
-- Tests render, validate, and format functions

local M = {}

---@param framework TestFramework
---@param assertions AssertionsModule
---@param mocks MocksModule
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local it_each = framework.it_each
  local expect = assertions.expect
  
  -- Import json module
  local json = require("json")
  
  describe("json editor", function()
    
    describe("render", function()
      it_each({
        { value = nil, desc = "nil value", expectedValue = "{}" },
        { value = "{}", desc = "empty object", expectedValue = "{}" },
        { value = '{"key":"value"}', desc = "simple object", expectedValue = '{"key":"value"}' },
        { value = "[]", desc = "empty array", expectedValue = "[]" },
        { value = '{"nested":{"deep":true}}', desc = "nested object", expectedValue = '{"nested":{"deep":true}}' }
      })("should render editor with $desc", function(tc)
        local result = json.render(tc.value)
        expect(result.type).toBe("code_editor")
        expect(result.props.language).toBe("json")
        expect(result.props.value).toBe(tc.expectedValue)
        expect(result.props.line_numbers).toBe(true)
        expect(result.props.auto_format).toBe(true)
      end)
      
      it_each({
        { readOnly = true, expected = true, desc = "read-only mode" },
        { readOnly = false, expected = false, desc = "editable mode" },
        { readOnly = nil, expected = false, desc = "default mode" }
      })("should handle $desc", function(tc)
        local options = tc.readOnly ~= nil and { read_only = tc.readOnly } or nil
        local result = json.render("{}", options)
        expect(result.props.read_only).toBe(tc.expected)
      end)
      
      it("should return correct component type", function()
        local result = json.render("{}")
        expect(result.type).toBe("code_editor")
        expect(result.props).toBeTruthy()
      end)
      
      it("should have correct default properties", function()
        local result = json.render()
        expect(result.props.language).toBe("json")
        expect(result.props.line_numbers).toBe(true)
        expect(result.props.auto_format).toBe(true)
        expect(result.props.read_only).toBe(false)
      end)
    end)
    
    describe("validate", function()
      it_each({
        { input = '{"valid":true}', desc = "valid object" },
        { input = '[]', desc = "empty array" },
        { input = '{"nested":{"obj":1}}', desc = "nested structure" },
        { input = '""', desc = "empty string" },
        { input = 'null', desc = "null value" }
      })("should validate $desc as valid", function(tc)
        local result = json.validate(tc.input)
        expect(result.valid).toBe(true)
        expect(result.errors).toBeTruthy()
        expect(#result.errors).toBe(0)
      end)
      
      it("should return validation result structure", function()
        local result = json.validate("{}")
        expect(result.valid).toBeType("boolean")
        expect(result.errors).toBeType("table")
      end)
      
      it("should handle empty string input", function()
        local result = json.validate("")
        expect(result).toBeTruthy()
        expect(result.valid).toBeType("boolean")
      end)
    end)
    
    describe("format", function()
      it_each({
        { input = '{"a":1}', desc = "simple object" },
        { input = '[]', desc = "empty array" },
        { input = '{"nested":{"deep":true}}', desc = "nested object" }
      })("should return format action for $desc", function(tc)
        local result = json.format(tc.input)
        expect(result.action).toBe("format")
        expect(result.language).toBe("json")
      end)
      
      it("should return correct action structure", function()
        local result = json.format("{}")
        expect(result.action).toBe("format")
        expect(result.language).toBe("json")
      end)
      
      it("should handle malformed input gracefully", function()
        local result = json.format("{invalid")
        expect(result.action).toBe("format")
        expect(result.language).toBe("json")
      end)
    end)
    
  end)
end

return M
