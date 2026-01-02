-- Tests for code_editor initialization
-- Tests init function and module properties

local M = {}

---@param framework TestFramework
---@param assertions AssertionsModule
---@param mocks MocksModule
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local it_each = framework.it_each
  local expect = assertions.expect
  
  -- Import init module
  local codeEditor = require("init")
  
  describe("code_editor init", function()
    
    describe("module properties", function()
      it("should have name property", function()
        expect(codeEditor.name).toBe("code_editor")
      end)
      
      it("should have version property", function()
        expect(codeEditor.version).toBeTruthy()
        expect(codeEditor.version).toBeType("string")
      end)
      
      it("should have version 1.0.0", function()
        expect(codeEditor.version).toBe("1.0.0")
      end)
      
      it_each({
        { property = "name", expectedType = "string", desc = "name is string" },
        { property = "version", expectedType = "string", desc = "version is string" }
      })("should have $desc", function(tc)
        expect(codeEditor[tc.property]).toBeType(tc.expectedType)
      end)
    end)
    
    describe("init function", function()
      it("should return result object", function()
        local result = codeEditor.init()
        expect(result).toBeTruthy()
        expect(result).toBeType("table")
      end)
      
      it("should return name in result", function()
        local result = codeEditor.init()
        expect(result.name).toBe("code_editor")
      end)
      
      it("should return version in result", function()
        local result = codeEditor.init()
        expect(result.version).toBe("1.0.0")
      end)
      
      it("should return loaded as true", function()
        local result = codeEditor.init()
        expect(result.loaded).toBe(true)
      end)
      
      it_each({
        { field = "name", expected = "code_editor", desc = "name field" },
        { field = "version", expected = "1.0.0", desc = "version field" },
        { field = "loaded", expected = true, desc = "loaded field" }
      })("should have correct $desc", function(tc)
        local result = codeEditor.init()
        expect(result[tc.field]).toBe(tc.expected)
      end)
      
      it("should be callable multiple times", function()
        local result1 = codeEditor.init()
        local result2 = codeEditor.init()
        expect(result1.loaded).toBe(true)
        expect(result2.loaded).toBe(true)
      end)
      
      it("should return consistent results", function()
        local result1 = codeEditor.init()
        local result2 = codeEditor.init()
        expect(result1.name).toBe(result2.name)
        expect(result1.version).toBe(result2.version)
        expect(result1.loaded).toBe(result2.loaded)
      end)
    end)
    
    describe("module structure", function()
      it("should have init function", function()
        expect(codeEditor.init).toBeType("function")
      end)
      
      it_each({
        { key = "name", desc = "name property" },
        { key = "version", desc = "version property" },
        { key = "init", desc = "init function" }
      })("should export $desc", function(tc)
        expect(codeEditor[tc.key]).toBeTruthy()
      end)
    end)
    
  end)
end

return M
