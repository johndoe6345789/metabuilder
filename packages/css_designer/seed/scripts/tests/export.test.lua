-- Tests for css_designer export functions
-- Parameterized tests using test cases from JSON

local cases = load_cases("export.cases.json")

describe("css_designer/export", function()
  
  describe("generate_scss_variables", function()
    it_each(cases.scss_output)("should generate SCSS for $theme_name theme", function(tc)
      -- Test that expected patterns appear in output
      local theme = tc.theme
      local scss = ""
      
      -- Generate color variables
      scss = scss .. "$color-primary: " .. theme.colors.primary.hex .. ";\n"
      scss = scss .. "$color-secondary: " .. theme.colors.secondary.hex .. ";\n"
      scss = scss .. "$font-family: '" .. theme.typography.fontFamily .. "', sans-serif;\n"
      scss = scss .. "$spacing-unit: " .. theme.spacing.spacingUnit .. "px;\n"
      scss = scss .. "$border-radius: " .. theme.spacing.borderRadius .. "px;\n"
      
      -- Check expected patterns
      for _, pattern in ipairs(tc.expected_patterns) do
        expect(scss:find(pattern, 1, true)).not_toBeNil()
      end
    end)
  end)
  
  describe("generate_css_variables", function()
    it_each(cases.css_output)("should generate CSS for $theme_name theme", function(tc)
      local theme = tc.theme
      local css = ":root {\n"
      
      css = css .. "  --color-primary: " .. theme.colors.primary.hex .. ";\n"
      css = css .. "  --color-secondary: " .. theme.colors.secondary.hex .. ";\n"
      css = css .. "  --font-family: '" .. theme.typography.fontFamily .. "', sans-serif;\n"
      css = css .. "  --spacing-unit: " .. theme.spacing.spacingUnit .. "px;\n"
      css = css .. "  --border-radius: " .. theme.spacing.borderRadius .. "px;\n"
      css = css .. "}"
      
      -- Check expected patterns
      for _, pattern in ipairs(tc.expected_patterns) do
        expect(css:find(pattern, 1, true)).not_toBeNil()
      end
    end)
  end)
end)
