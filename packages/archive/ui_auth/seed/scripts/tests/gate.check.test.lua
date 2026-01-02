-- Gate Check Tests
-- Parameterized tests for auth gate check functionality

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")
local beforeEach = require("lua_test.beforeEach")
local mock = require("lua_test.mock")

local cases = require("tests.gate.cases")
local checkModule = require("gate.check")

describe("gate", function()
  -- Mock the check module
  beforeEach(function()
    _G.check = {
      can_access = mock.fn(function(user, level)
        return user.level and user.level >= level
      end)
    }
  end)

  describe("check", function()
    describe("authentication", function()
      it_each(cases.check.unauthenticated, "$description", function(case)
        local ctx = { user = case.user, requiredLevel = case.requiredLevel }
        local result = checkModule.check(ctx)
        expect(result.allowed).toBe(false)
        expect(result.reason).toBe("not_authenticated")
        expect(result.redirect).toBe("/login")
      end)
    end)

    describe("authorization", function()
      it_each(cases.check.authorized, "$description (level $userLevel >= $requiredLevel)", function(case)
        local user = { id = "user_123", level = case.userLevel }
        local ctx = { user = user, requiredLevel = case.requiredLevel }
        local result = checkModule.check(ctx)
        expect(result.allowed).toBe(true)
        expect(result.reason).toBe(nil)
      end)

      it_each(cases.check.unauthorized, "$description (level $userLevel < $requiredLevel)", function(case)
        local user = { id = "user_123", level = case.userLevel }
        local ctx = { user = user, requiredLevel = case.requiredLevel }
        
        -- Ensure mock returns false for insufficient level
        _G.check.can_access = mock.fn(function(u, l)
          return u.level >= l
        end)
        
        local result = checkModule.check(ctx)
        expect(result.allowed).toBe(false)
        expect(result.reason).toBe("insufficient_permission")
      end)
    end)

    describe("no level requirement", function()
      it_each(cases.check.noLevelRequired, "$description", function(case)
        local user = { id = "user_123", level = case.userLevel }
        local ctx = { user = user } -- No requiredLevel
        local result = checkModule.check(ctx)
        expect(result.allowed).toBe(true)
      end)
    end)
  end)
end)

return {
  name = "gate.check.test",
  description = "Tests for auth gate check function"
}
