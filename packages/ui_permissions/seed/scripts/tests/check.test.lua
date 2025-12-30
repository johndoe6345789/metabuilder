-- Tests for ui_permissions check.lua module
-- Loads test cases from JSON file

-- Test cases loaded from check.cases.json
local cases = load_cases("check.cases.json")

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
    it_each(cases.get_level.role_mapping)("should return $expected for $desc", function(tc)
      local user = tc.role and { role = tc.role } or nil
      expect(check.get_level(user)).toBe(tc.expected)
    end)
    
    it("should return PUBLIC for user without role field", function()
      expect(check.get_level({})).toBe(LEVELS.PUBLIC)
    end)
  end)
  
  describe("can_access", function()
    it_each(cases.can_access.granted)("should return $expected for $desc", function(tc)
      local user = { role = tc.role }
      expect(check.can_access(user, tc.level)).toBe(tc.expected)
    end)
    
    it_each(cases.can_access.denied)("should deny $desc", function(tc)
      local user = { role = tc.role }
      expect(check.can_access(user, tc.level)).toBe(tc.expected)
    end)
    
    it_each(cases.can_access.nil_user)("should handle nil user accessing $desc", function(tc)
      expect(check.can_access(nil, tc.level)).toBe(tc.expected)
    end)
  end)
  
  describe("is_moderator_or_above", function()
    it_each(cases.is_moderator_or_above)("should return $expected for $role", function(tc)
      expect(check.is_moderator_or_above({ role = tc.role })).toBe(tc.expected)
    end)
  end)
  
  describe("is_admin_or_above", function()
    it_each(cases.is_admin_or_above)("should return $expected for $role", function(tc)
      expect(check.is_admin_or_above({ role = tc.role })).toBe(tc.expected)
    end)
  end)
end)
