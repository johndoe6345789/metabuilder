-- Tests for editor submodules (syntax, toolbar, gutter)
-- Tests syntax highlighting, toolbar config, and gutter config

local M = {}

---@param framework TestFramework
---@param assertions AssertionsModule
---@param mocks MocksModule
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local it_each = framework.it_each
  local expect = assertions.expect
  
  -- Import editor submodules
  local syntax = require("editor.syntax")
  local toolbar = require("editor.toolbar")
  local gutter = require("editor.gutter")
  
  describe("editor modules", function()
    
    describe("syntax", function()
      it_each({
        { language = "typescript", desc = "TypeScript" },
        { language = "lua", desc = "Lua" },
        { language = "python", desc = "Python" }
      })("should return theme for $desc", function(tc)
        local result = syntax(tc.language)
        expect(result).toBeTruthy()
        expect(result.keyword).toBeTruthy()
        expect(result.string).toBeTruthy()
        expect(result.comment).toBeTruthy()
      end)
      
      it("should return TypeScript theme colors", function()
        local result = syntax("typescript")
        expect(result.keyword).toBe("#569cd6")
        expect(result.string).toBe("#ce9178")
        expect(result.comment).toBe("#6a9955")
      end)
      
      it("should return Lua theme colors", function()
        local result = syntax("lua")
        expect(result.keyword).toBe("#c586c0")
        expect(result.string).toBe("#ce9178")
        expect(result.comment).toBe("#6a9955")
      end)
      
      it("should return Python theme colors", function()
        local result = syntax("python")
        expect(result.keyword).toBe("#569cd6")
        expect(result.string).toBe("#ce9178")
        expect(result.comment).toBe("#6a9955")
      end)
      
      it_each({
        { language = "unknown", desc = "unknown language" },
        { language = "rust", desc = "unsupported language" },
        { language = "go", desc = "another unsupported language" }
      })("should fallback to TypeScript for $desc", function(tc)
        local result = syntax(tc.language)
        local tsTheme = syntax("typescript")
        expect(result.keyword).toBe(tsTheme.keyword)
        expect(result.string).toBe(tsTheme.string)
        expect(result.comment).toBe(tsTheme.comment)
      end)
      
      it("should return valid hex colors", function()
        local result = syntax("lua")
        expect(result.keyword:match("^#%x%x%x%x%x%x$")).toBeTruthy()
        expect(result.string:match("^#%x%x%x%x%x%x$")).toBeTruthy()
        expect(result.comment:match("^#%x%x%x%x%x%x$")).toBeTruthy()
      end)
    end)
    
    describe("toolbar", function()
      it("should return default actions when none provided", function()
        local result = toolbar()
        expect(result.type).toBe("editor_toolbar")
        expect(result.actions).toBeTruthy()
        expect(#result.actions).toBe(4)
      end)
      
      it("should include save, undo, redo, format by default", function()
        local result = toolbar()
        local hasAction = {}
        for _, action in ipairs(result.actions) do
          hasAction[action] = true
        end
        expect(hasAction["save"]).toBe(true)
        expect(hasAction["undo"]).toBe(true)
        expect(hasAction["redo"]).toBe(true)
        expect(hasAction["format"]).toBe(true)
      end)
      
      it_each({
        { actions = { "save" }, expected = 1, desc = "single action" },
        { actions = { "save", "undo" }, expected = 2, desc = "two actions" },
        { actions = { "save", "undo", "redo", "format", "copy", "paste" }, expected = 6, desc = "extended actions" },
        { actions = {}, expected = 0, desc = "empty actions" }
      })("should handle $desc", function(tc)
        local result = toolbar(tc.actions)
        expect(#result.actions).toBe(tc.expected)
      end)
      
      it("should use provided custom actions", function()
        local customActions = { "copy", "paste", "cut" }
        local result = toolbar(customActions)
        expect(result.actions[1]).toBe("copy")
        expect(result.actions[2]).toBe("paste")
        expect(result.actions[3]).toBe("cut")
      end)
      
      it("should return correct component type", function()
        local result = toolbar()
        expect(result.type).toBe("editor_toolbar")
      end)
    end)
    
    describe("gutter", function()
      it("should show line numbers by default", function()
        local result = gutter()
        expect(result.showLineNumbers).toBe(true)
      end)
      
      it("should show fold markers by default", function()
        local result = gutter()
        expect(result.showFoldMarkers).toBe(true)
      end)
      
      it_each({
        { showLineNumbers = true, showFoldMarkers = true, desc = "both enabled" },
        { showLineNumbers = false, showFoldMarkers = true, desc = "no line numbers" },
        { showLineNumbers = true, showFoldMarkers = false, desc = "no fold markers" },
        { showLineNumbers = false, showFoldMarkers = false, desc = "both disabled" }
      })("should handle $desc", function(tc)
        local result = gutter(tc.showLineNumbers, tc.showFoldMarkers)
        expect(result.showLineNumbers).toBe(tc.showLineNumbers)
        expect(result.showFoldMarkers).toBe(tc.showFoldMarkers)
      end)
      
      it("should return correct component type", function()
        local result = gutter()
        expect(result.type).toBe("editor_gutter")
      end)
      
      it("should default to true when nil passed for line numbers", function()
        local result = gutter(nil, true)
        expect(result.showLineNumbers).toBe(true)
      end)
      
      it("should default to true when nil passed for fold markers", function()
        local result = gutter(true, nil)
        expect(result.showFoldMarkers).toBe(true)
      end)
      
      it("should treat false explicitly", function()
        local result = gutter(false, false)
        expect(result.showLineNumbers).toBe(false)
        expect(result.showFoldMarkers).toBe(false)
      end)
    end)
    
  end)
end

return M
