-- Tests for Lua editor utilities
-- Tests render, validate, and run_sandbox functions

local M = {}

---@param framework TestFramework
---@param assertions AssertionsModule
---@param mocks MocksModule
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local it_each = framework.it_each
  local expect = assertions.expect
  
  -- Import lua module
  local lua = require("lua")
  
  describe("lua editor", function()
    
    describe("render", function()
      it_each({
        { value = nil, desc = "nil value", expectedValue = "" },
        { value = "", desc = "empty string", expectedValue = "" },
        { value = "print('hello')", desc = "simple print", expectedValue = "print('hello')" },
        { value = "local x = 1", desc = "variable declaration", expectedValue = "local x = 1" },
        { value = "function test()\n  return true\nend", desc = "function definition", expectedValue = "function test()\n  return true\nend" }
      })("should render editor with $desc", function(tc)
        local result = lua.render(tc.value)
        expect(result.type).toBe("code_editor")
        expect(result.props.language).toBe("lua")
        expect(result.props.value).toBe(tc.expectedValue)
        expect(result.props.line_numbers).toBe(true)
        expect(result.props.show_snippets).toBe(true)
      end)
      
      it_each({
        { readOnly = true, expected = true, desc = "read-only mode" },
        { readOnly = false, expected = false, desc = "editable mode" },
        { readOnly = nil, expected = false, desc = "default mode" }
      })("should handle $desc", function(tc)
        local options = tc.readOnly ~= nil and { read_only = tc.readOnly } or nil
        local result = lua.render("", options)
        expect(result.props.read_only).toBe(tc.expected)
      end)
      
      it("should return correct component type", function()
        local result = lua.render("")
        expect(result.type).toBe("code_editor")
        expect(result.props).toBeTruthy()
      end)
      
      it("should have correct default properties", function()
        local result = lua.render()
        expect(result.props.language).toBe("lua")
        expect(result.props.line_numbers).toBe(true)
        expect(result.props.show_snippets).toBe(true)
        expect(result.props.read_only).toBe(false)
      end)
      
      it("should include snippet support", function()
        local result = lua.render("local x = 1")
        expect(result.props.show_snippets).toBe(true)
      end)
    end)
    
    describe("validate", function()
      it_each({
        { input = "local x = 1", desc = "variable declaration" },
        { input = "function test() end", desc = "empty function" },
        { input = "return true", desc = "return statement" },
        { input = "for i = 1, 10 do end", desc = "for loop" },
        { input = "if true then end", desc = "if statement" }
      })("should validate $desc as valid", function(tc)
        local result = lua.validate(tc.input)
        expect(result.valid).toBe(true)
        expect(result.errors).toBeTruthy()
        expect(#result.errors).toBe(0)
      end)
      
      it("should return validation result structure", function()
        local result = lua.validate("local x = 1")
        expect(result.valid).toBeType("boolean")
        expect(result.errors).toBeType("table")
      end)
      
      it("should handle empty string input", function()
        local result = lua.validate("")
        expect(result).toBeTruthy()
        expect(result.valid).toBeType("boolean")
      end)
      
      it("should handle multiline code", function()
        local code = [[
local function test()
  local x = 1
  return x + 1
end
]]
        local result = lua.validate(code)
        expect(result).toBeTruthy()
        expect(result.valid).toBeType("boolean")
      end)
    end)
    
    describe("run_sandbox", function()
      it_each({
        { code = "return 1", context = nil, desc = "simple return" },
        { code = "local x = 1; return x", context = nil, desc = "variable and return" },
        { code = "return ctx.value", context = { value = 42 }, desc = "context access" }
      })("should create sandbox action for $desc", function(tc)
        local result = lua.run_sandbox(tc.code, tc.context)
        expect(result.action).toBe("execute")
        expect(result.sandbox).toBe(true)
      end)
      
      it("should always set sandbox to true", function()
        local result = lua.run_sandbox("print('hello')")
        expect(result.sandbox).toBe(true)
      end)
      
      it("should use empty context when none provided", function()
        local result = lua.run_sandbox("return 1")
        expect(result.context).toBeTruthy()
        expect(result.context).toBeType("table")
      end)
      
      it("should preserve provided context", function()
        local ctx = { user = "test", value = 123 }
        local result = lua.run_sandbox("return ctx.value", ctx)
        expect(result.context).toBeTruthy()
        expect(result.context.user).toBe("test")
        expect(result.context.value).toBe(123)
      end)
      
      it("should return correct action structure", function()
        local result = lua.run_sandbox("local x = 1")
        expect(result.action).toBe("execute")
        expect(result.sandbox).toBe(true)
        expect(result.context).toBeType("table")
      end)
    end)
    
  end)
end

return M
