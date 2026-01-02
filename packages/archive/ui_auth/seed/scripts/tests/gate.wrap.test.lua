-- Gate Wrap Tests
-- Parameterized tests for auth gate wrap functionality

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")
local beforeEach = require("lua_test.beforeEach")
local mock = require("lua_test.mock")

local cases = require("tests.gate.cases")
local wrapModule = require("gate.wrap")

describe("gate.wrap", function()
  -- Mock the check module
  beforeEach(function()
    _G.check = {
      can_access = mock.fn(function(user, level)
        return user.level and user.level >= level
      end)
    }
  end)

  describe("when authenticated and authorized", function()
    it_each(cases.wrap.allowed, "$description", function(case)
      local user = { id = "user_123", level = case.userLevel }
      local children = { type = "Dashboard", props = {} }
      local ctx = { user = user, requiredLevel = case.requiredLevel, children = children }
      
      local result = wrapModule.wrap(ctx)
      expect(result).toBe(children)
    end)
  end)

  describe("when not authenticated", function()
    it_each(cases.wrap.redirect, "$description", function(case)
      local ctx = { user = nil, children = {} }
      local result = wrapModule.wrap(ctx)
      expect(result.type).toBe("Redirect")
      expect(result.props.to).toBe("/login")
    end)
  end)

  describe("when not authorized", function()
    it_each(cases.wrap.denied, "$description (level $userLevel < $requiredLevel)", function(case)
      local user = { id = "user_123", level = case.userLevel }
      local ctx = { user = user, requiredLevel = case.requiredLevel, children = {} }
      
      -- Ensure mock returns false
      _G.check.can_access = mock.fn(function(u, l)
        return u.level >= l
      end)
      
      local result = wrapModule.wrap(ctx)
      expect(result.type).toBe("AccessDenied")
      expect(result.props.reason).toBe("insufficient_permission")
    end)
  end)
end)

return {
  name = "gate.wrap.test",
  description = "Tests for auth gate wrap function"
}
