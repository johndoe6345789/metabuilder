-- Config module tests
-- Tests the role editor component generation

describe("Config Module", function()
  local cases = load_cases("config.cases.json")
  local role_editor = require("role.editor")

  describe("RoleEditor.create", function()
    it_each(cases.roleEditor, "$desc", function(tc)
      local result = role_editor.create(tc.input)
      expect(result).toBeDefined()
      expect(result.type).toBe(tc.expected_type)
      expect(result.children).toBeDefined()
    end)

    it("creates valid UI component structure", function()
      local result = role_editor.create({ role = "admin" })
      expect(result.type).toBe("Card")
      expect(result.children).toBeDefined()
      -- Should have CardHeader and CardContent
      expect(#result.children).toBeGreaterThanOrEqual(2)
    end)

    it("includes instance owner toggle when enabled", function()
      local result = role_editor.create({
        role = "god",
        showInstanceOwner = true,
        isInstanceOwner = true
      })
      -- Find the CardContent
      local cardContent = result.children[2]
      expect(cardContent.type).toBe("CardContent")
      -- Should have more children when instance owner is shown
      expect(#cardContent.children).toBeGreaterThan(2)
    end)
  end)
end)
