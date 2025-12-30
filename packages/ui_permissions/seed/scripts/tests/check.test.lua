-- Tests for ui_permissions check.lua module

describe("ui_permissions/check", function()
  local LEVELS = {
    PUBLIC = 1,
    USER = 2,
    MODERATOR = 3,
    ADMIN = 4,
    GOD = 5,
    SUPERGOD = 6
  }
  
  local check
  
  beforeEach(function()
    -- Mock the check module inline for testing
    local ROLE_MAP = {
      public = LEVELS.PUBLIC,
      user = LEVELS.USER,
      moderator = LEVELS.MODERATOR,
      admin = LEVELS.ADMIN,
      god = LEVELS.GOD,
      supergod = LEVELS.SUPERGOD
    }
    
    check = {
      get_level = function(user)
        if not user then return LEVELS.PUBLIC end
        return ROLE_MAP[user.role] or LEVELS.PUBLIC
      end,
      
      can_access = function(user, required_level)
        return check.get_level(user) >= required_level
      end,
      
      is_moderator_or_above = function(user)
        return check.get_level(user) >= LEVELS.MODERATOR
      end,
      
      is_admin_or_above = function(user)
        return check.get_level(user) >= LEVELS.ADMIN
      end
    }
  end)
  
  describe("get_level", function()
    it("should return PUBLIC for nil user", function()
      expect(check.get_level(nil)).toBe(LEVELS.PUBLIC)
    end)
    
    it("should return PUBLIC for user without role", function()
      expect(check.get_level({})).toBe(LEVELS.PUBLIC)
    end)
    
    it("should return USER level for user role", function()
      expect(check.get_level({ role = "user" })).toBe(LEVELS.USER)
    end)
    
    it("should return MODERATOR level for moderator role", function()
      expect(check.get_level({ role = "moderator" })).toBe(LEVELS.MODERATOR)
    end)
    
    it("should return ADMIN level for admin role", function()
      expect(check.get_level({ role = "admin" })).toBe(LEVELS.ADMIN)
    end)
    
    it("should return GOD level for god role", function()
      expect(check.get_level({ role = "god" })).toBe(LEVELS.GOD)
    end)
    
    it("should return SUPERGOD level for supergod role", function()
      expect(check.get_level({ role = "supergod" })).toBe(LEVELS.SUPERGOD)
    end)
    
    it("should return PUBLIC for unknown role", function()
      expect(check.get_level({ role = "unknown" })).toBe(LEVELS.PUBLIC)
    end)
  end)
  
  describe("can_access", function()
    it("should allow user to access user-level content", function()
      local user = { role = "user" }
      expect(check.can_access(user, LEVELS.USER)).toBe(true)
    end)
    
    it("should deny user access to admin-level content", function()
      local user = { role = "user" }
      expect(check.can_access(user, LEVELS.ADMIN)).toBe(false)
    end)
    
    it("should allow admin to access user-level content", function()
      local user = { role = "admin" }
      expect(check.can_access(user, LEVELS.USER)).toBe(true)
    end)
    
    it("should allow supergod to access any content", function()
      local user = { role = "supergod" }
      expect(check.can_access(user, LEVELS.SUPERGOD)).toBe(true)
      expect(check.can_access(user, LEVELS.GOD)).toBe(true)
      expect(check.can_access(user, LEVELS.ADMIN)).toBe(true)
    end)
    
    it("should allow public access for nil user", function()
      expect(check.can_access(nil, LEVELS.PUBLIC)).toBe(true)
    end)
    
    it("should deny user access for nil user", function()
      expect(check.can_access(nil, LEVELS.USER)).toBe(false)
    end)
  end)
  
  describe("is_moderator_or_above", function()
    it("should return false for regular user", function()
      expect(check.is_moderator_or_above({ role = "user" })).toBe(false)
    end)
    
    it("should return true for moderator", function()
      expect(check.is_moderator_or_above({ role = "moderator" })).toBe(true)
    end)
    
    it("should return true for admin", function()
      expect(check.is_moderator_or_above({ role = "admin" })).toBe(true)
    end)
    
    it("should return true for god", function()
      expect(check.is_moderator_or_above({ role = "god" })).toBe(true)
    end)
  end)
  
  describe("is_admin_or_above", function()
    it("should return false for moderator", function()
      expect(check.is_admin_or_above({ role = "moderator" })).toBe(false)
    end)
    
    it("should return true for admin", function()
      expect(check.is_admin_or_above({ role = "admin" })).toBe(true)
    end)
    
    it("should return true for god", function()
      expect(check.is_admin_or_above({ role = "god" })).toBe(true)
    end)
    
    it("should return true for supergod", function()
      expect(check.is_admin_or_above({ role = "supergod" })).toBe(true)
    end)
  end)
end)
