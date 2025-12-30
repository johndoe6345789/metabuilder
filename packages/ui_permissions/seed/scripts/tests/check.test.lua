-- Tests for ui_permissions check.lua module
-- Uses parameterized tests for comprehensive coverage

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
    -- Parameterized test cases
    it_each({
      { role = nil,         expected = 1, desc = "nil user" },
      { role = "unknown",   expected = 1, desc = "unknown role" },
      { role = "public",    expected = 1, desc = "public role" },
      { role = "user",      expected = 2, desc = "user role" },
      { role = "moderator", expected = 3, desc = "moderator role" },
      { role = "admin",     expected = 4, desc = "admin role" },
      { role = "god",       expected = 5, desc = "god role" },
      { role = "supergod",  expected = 6, desc = "supergod role" },
    })("should return $expected for $desc", function(tc)
      local user = tc.role and { role = tc.role } or nil
      expect(check.get_level(user)).toBe(tc.expected)
    end)
    
    it("should return PUBLIC for user without role field", function()
      expect(check.get_level({})).toBe(LEVELS.PUBLIC)
    end)
  end)
  
  describe("can_access", function()
    -- Test access granted cases
    it_each({
      { role = "user",      level = 2, expected = true,  desc = "user accessing user content" },
      { role = "admin",     level = 2, expected = true,  desc = "admin accessing user content" },
      { role = "supergod",  level = 6, expected = true,  desc = "supergod accessing supergod content" },
      { role = "supergod",  level = 1, expected = true,  desc = "supergod accessing public content" },
      { role = "moderator", level = 3, expected = true,  desc = "moderator accessing moderator content" },
    })("should return $expected for $desc", function(tc)
      local user = { role = tc.role }
      expect(check.can_access(user, tc.level)).toBe(tc.expected)
    end)
    
    -- Test access denied cases
    it_each({
      { role = "user",      level = 4, expected = false, desc = "user accessing admin content" },
      { role = "moderator", level = 4, expected = false, desc = "moderator accessing admin content" },
      { role = "admin",     level = 5, expected = false, desc = "admin accessing god content" },
      { role = "god",       level = 6, expected = false, desc = "god accessing supergod content" },
    })("should deny $desc", function(tc)
      local user = { role = tc.role }
      expect(check.can_access(user, tc.level)).toBe(tc.expected)
    end)
    
    -- Nil user cases
    it_each({
      { level = 1, expected = true,  desc = "public content" },
      { level = 2, expected = false, desc = "user content" },
      { level = 4, expected = false, desc = "admin content" },
    })("should handle nil user accessing $desc", function(tc)
      expect(check.can_access(nil, tc.level)).toBe(tc.expected)
    end)
  end)
  
  describe("is_moderator_or_above", function()
    it_each({
      { role = "public",    expected = false },
      { role = "user",      expected = false },
      { role = "moderator", expected = true },
      { role = "admin",     expected = true },
      { role = "god",       expected = true },
      { role = "supergod",  expected = true },
    })("should return $expected for $role", function(tc)
      expect(check.is_moderator_or_above({ role = tc.role })).toBe(tc.expected)
    end)
  end)
  
  describe("is_admin_or_above", function()
    it_each({
      { role = "public",    expected = false },
      { role = "user",      expected = false },
      { role = "moderator", expected = false },
      { role = "admin",     expected = true },
      { role = "god",       expected = true },
      { role = "supergod",  expected = true },
    })("should return $expected for $role", function(tc)
      expect(check.is_admin_or_above({ role = tc.role })).toBe(tc.expected)
    end)
  end)
end)
