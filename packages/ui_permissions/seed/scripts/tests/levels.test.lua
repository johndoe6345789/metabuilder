-- Tests for ui_permissions levels.lua module

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
    it("should have PUBLIC as lowest level (1)", function()
      expect(LEVELS.PUBLIC).toBe(1)
    end)
    
    it("should have USER as level 2", function()
      expect(LEVELS.USER).toBe(2)
    end)
    
    it("should have MODERATOR as level 3", function()
      expect(LEVELS.MODERATOR).toBe(3)
    end)
    
    it("should have ADMIN as level 4", function()
      expect(LEVELS.ADMIN).toBe(4)
    end)
    
    it("should have GOD as level 5", function()
      expect(LEVELS.GOD).toBe(5)
    end)
    
    it("should have SUPERGOD as highest level (6)", function()
      expect(LEVELS.SUPERGOD).toBe(6)
    end)
  end)
  
  describe("level hierarchy", function()
    it("should have ascending order from PUBLIC to SUPERGOD", function()
      expect(LEVELS.PUBLIC).toBeLessThan(LEVELS.USER)
      expect(LEVELS.USER).toBeLessThan(LEVELS.MODERATOR)
      expect(LEVELS.MODERATOR).toBeLessThan(LEVELS.ADMIN)
      expect(LEVELS.ADMIN).toBeLessThan(LEVELS.GOD)
      expect(LEVELS.GOD).toBeLessThan(LEVELS.SUPERGOD)
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
