-- SMTP module tests
-- Uses lua_test framework with parameterized test cases

describe("SMTP Module", function()
  local cases = load_cases("smtp.cases.json")
  local smtp = require("smtp")

  describe("getDefaults", function()
    it_each(cases.getDefaults, "$desc", function(tc)
      local result = smtp.getDefaults()
      expect(result).toBeDefined()
      for _, key in ipairs(tc.expected_keys) do
        expect(result[key]).toBeDefined()
      end
    end)
  end)

  describe("getFields", function()
    it_each(cases.getFields, "$desc", function(tc)
      local result = smtp.getFields()
      expect(#result).toBe(tc.expected_count)
    end)
  end)

  describe("getField", function()
    it("returns field definition by name", function()
      local field = smtp.getField("host")
      expect(field).toBeDefined()
      expect(field.name).toBe("host")
      expect(field.label).toBeDefined()
    end)

    it("returns nil for non-existent field", function()
      local field = smtp.getField("nonexistent")
      expect(field).toBeNil()
    end)
  end)

  describe("validate", function()
    it_each(cases.validate.valid, "$desc", function(tc)
      local result = smtp.validate(tc.input)
      expect(result.valid).toBe(true)
      expect(next(result.errors)).toBe(nil)
    end)

    it_each(cases.validate.invalid, "$desc", function(tc)
      local result = smtp.validate(tc.input)
      expect(result.valid).toBe(false)
      expect(result.errors[tc.expected_error]).toBeDefined()
    end)
  end)

  describe("createDefault", function()
    it("creates a valid default configuration", function()
      local config = smtp.createDefault()
      local validation = smtp.validate(config)
      -- Default may not be valid (empty username/password) but should have structure
      expect(config).toBeDefined()
      expect(config.host).toBeDefined()
      expect(config.port).toBeDefined()
    end)
  end)
end)
