-- Tests for ui_permissions levels.lua module
-- Uses parameterized tests

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
    it_each({
      { name = "PUBLIC",    value = 1 },
      { name = "USER",      value = 2 },
      { name = "MODERATOR", value = 3 },
      { name = "ADMIN",     value = 4 },
      { name = "GOD",       value = 5 },
      { name = "SUPERGOD",  value = 6 },
    })("should have $name as level $value", function(tc)
      expect(LEVELS[tc.name]).toBe(tc.value)
    end)
  end)
  
  describe("level hierarchy", function()
    it_each({
      { lower = "PUBLIC",    higher = "USER" },
      { lower = "USER",      higher = "MODERATOR" },
      { lower = "MODERATOR", higher = "ADMIN" },
      { lower = "ADMIN",     higher = "GOD" },
      { lower = "GOD",       higher = "SUPERGOD" },
    })("should have $lower < $higher", function(tc)
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
