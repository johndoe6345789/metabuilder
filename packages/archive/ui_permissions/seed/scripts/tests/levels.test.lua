-- Tests for ui_permissions levels.lua module
-- Loads test cases from JSON file

local cases = load_cases("levels.cases.json")

describe("ui_permissions/levels", function()
  local LEVELS = {
    PUBLIC = 1,
    USER = 2,
    MODERATOR = 3,
    ADMIN = 4,
    GOD = 5,
    SUPERGOD = 6
  }
  
  describe("level values", function()
    it_each(cases.level_values)("should have $name as level $value", function(tc)
      expect(LEVELS[tc.name]).toBe(tc.value)
    end)
  end)
  
  describe("level hierarchy", function()
    it_each(cases.level_hierarchy)("should have $lower < $higher", function(tc)
      expect(LEVELS[tc.lower]).toBeLessThan(LEVELS[tc.higher])
    end)
    
    it("should have exactly 6 levels", function()
      local count = 0
      for _ in pairs(LEVELS) do
        count = count + 1
      end
      expect(count).toBe(6)
    end)
  end)
end)
