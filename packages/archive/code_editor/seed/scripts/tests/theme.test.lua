-- Tests for theme editor utilities
-- Tests render, color_picker, and mode_toggle functions

local M = {}

---@param framework TestFramework
---@param assertions AssertionsModule
---@param mocks MocksModule
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local it_each = framework.it_each
  local expect = assertions.expect
  
  -- Import theme module
  local theme = require("theme")
  
  describe("theme editor", function()
    
    describe("render", function()
      it_each({
        { theme = nil, expectedPrimary = "#1976d2", expectedSecondary = "#dc004e", expectedMode = "light", desc = "default theme" },
        { theme = {}, expectedPrimary = "#1976d2", expectedSecondary = "#dc004e", expectedMode = "light", desc = "empty theme object" },
        { theme = { primary = "#ff0000" }, expectedPrimary = "#ff0000", expectedSecondary = "#dc004e", expectedMode = "light", desc = "custom primary only" },
        { theme = { secondary = "#00ff00" }, expectedPrimary = "#1976d2", expectedSecondary = "#00ff00", expectedMode = "light", desc = "custom secondary only" },
        { theme = { mode = "dark" }, expectedPrimary = "#1976d2", expectedSecondary = "#dc004e", expectedMode = "dark", desc = "dark mode" }
      })("should render with $desc", function(tc)
        local result = theme.render(tc.theme)
        expect(result.type).toBe("theme_editor")
        expect(result.props.primary).toBe(tc.expectedPrimary)
        expect(result.props.secondary).toBe(tc.expectedSecondary)
        expect(result.props.mode).toBe(tc.expectedMode)
      end)
      
      it("should handle full custom theme", function()
        local customTheme = {
          primary = "#123456",
          secondary = "#654321",
          mode = "dark"
        }
        local result = theme.render(customTheme)
        expect(result.props.primary).toBe("#123456")
        expect(result.props.secondary).toBe("#654321")
        expect(result.props.mode).toBe("dark")
      end)
      
      it("should return correct component type", function()
        local result = theme.render()
        expect(result.type).toBe("theme_editor")
        expect(result.props).toBeTruthy()
      end)
      
      it_each({
        { mode = "light", desc = "light mode" },
        { mode = "dark", desc = "dark mode" },
        { mode = "system", desc = "system mode" }
      })("should accept $desc", function(tc)
        local result = theme.render({ mode = tc.mode })
        expect(result.props.mode).toBe(tc.mode)
      end)
    end)
    
    describe("color_picker", function()
      it_each({
        { name = "primary", value = "#1976d2", desc = "primary color" },
        { name = "secondary", value = "#dc004e", desc = "secondary color" },
        { name = "background", value = "#ffffff", desc = "background color" },
        { name = "text", value = "#000000", desc = "text color" },
        { name = "error", value = "#f44336", desc = "error color" }
      })("should create picker for $desc", function(tc)
        local result = theme.color_picker(tc.name, tc.value)
        expect(result.type).toBe("color_picker")
        expect(result.props.name).toBe(tc.name)
        expect(result.props.value).toBe(tc.value)
      end)
      
      it("should disable alpha by default", function()
        local result = theme.color_picker("test", "#ffffff")
        expect(result.props.show_alpha).toBe(false)
      end)
      
      it("should return correct component type", function()
        local result = theme.color_picker("primary", "#1976d2")
        expect(result.type).toBe("color_picker")
        expect(result.props).toBeTruthy()
      end)
      
      it_each({
        { value = "#fff", desc = "shorthand hex" },
        { value = "#ffffff", desc = "full hex" },
        { value = "#FFFFFF", desc = "uppercase hex" },
        { value = "#aabbcc", desc = "lowercase hex" }
      })("should accept $desc format", function(tc)
        local result = theme.color_picker("test", tc.value)
        expect(result.props.value).toBe(tc.value)
      end)
    end)
    
    describe("mode_toggle", function()
      it("should return switch component", function()
        local result = theme.mode_toggle()
        expect(result.type).toBe("switch")
      end)
      
      it("should have Dark Mode label", function()
        local result = theme.mode_toggle()
        expect(result.props.label).toBe("Dark Mode")
      end)
      
      it("should have dark_mode name", function()
        local result = theme.mode_toggle()
        expect(result.props.name).toBe("dark_mode")
      end)
      
      it("should return correct structure", function()
        local result = theme.mode_toggle()
        expect(result.type).toBe("switch")
        expect(result.props).toBeTruthy()
        expect(result.props.label).toBeTruthy()
        expect(result.props.name).toBeTruthy()
      end)
    end)
    
  end)
end

return M
