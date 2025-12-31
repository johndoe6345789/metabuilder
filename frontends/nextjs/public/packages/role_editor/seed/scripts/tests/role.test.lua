-- Role module tests
-- Uses lua_test framework with parameterized test cases

describe("Role Module", function()
  local cases = load_cases("role.cases.json")
  local role = require("role")

  describe("getRoleLabel", function()
    it_each(cases.getRoleLabel, "$desc", function(tc)
      local result = role.getRoleLabel(tc.input)
      expect(result).toBe(tc.expected)
    end)
  end)

  describe("isValidRole", function()
    it_each(cases.isValidRole, "$desc", function(tc)
      local result = role.isValidRole(tc.input)
      expect(result).toBe(tc.expected)
    end)
  end)

  describe("getAllRoles", function()
    it_each(cases.getAllRoles, "$desc", function(tc)
      local result = role.getAllRoles()
      expect(#result).toBe(#tc.expected)
      for i, expectedRole in ipairs(tc.expected) do
        expect(result[i]).toBe(expectedRole)
      end
    end)
  end)

  describe("filterRoles", function()
    it_each(cases.filterRoles, "$desc", function(tc)
      local result = role.filterRoles(tc.input)
      expect(#result).toBe(tc.expected_length)
    end)
  end)

  describe("getRoleInfo", function()
    it("returns role info with all required fields", function()
      local info = role.getRoleInfo("admin")
      expect(info).toBeDefined()
      expect(info.label).toBeDefined()
      expect(info.blurb).toBeDefined()
      expect(info.highlights).toBeDefined()
      expect(#info.highlights).toBeGreaterThan(0)
    end)
  end)
end)
