-- Transfer Tests for ui_level5
-- Parameterized tests for god-level transfer functions

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")
local beforeEach = require("lua_test.beforeEach")
local mock = require("lua_test.mock")

local cases = require("tests.transfer.cases")
local initiateTransfer = require("transfer.initiate_transfer")
local confirmTransfer = require("transfer.confirm_transfer")
local assignGod = require("transfer.assign_god")

describe("transfer (level5)", function()
  -- Mock permission system and levels
  beforeEach(function()
    _G.LEVELS = {
      PUBLIC = 1,
      USER = 2,
      MODERATOR = 3,
      ADMIN = 4,
      GOD = 5,
      SUPERGOD = 6
    }
    _G.check = {
      can_access = mock.fn(function(user, level)
        return user.level and user.level >= level
      end)
    }
  end)

  describe("initiateTransfer", function()
    describe("with supergod permissions", function()
      it_each(cases.initiateTransfer.authorized, "$description", function(case)
        local user = { id = "god_1", level = case.userLevel }
        local ctx = { user = user, tenantId = case.tenantId }
        local result = initiateTransfer.initiateTransfer(ctx)
        expect(result.success).toBe(true)
        expect(result.action).toBe("open_transfer_dialog")
        expect(result.tenantId).toBe(case.tenantId)
      end)
    end)

    describe("without supergod permissions", function()
      it_each(cases.initiateTransfer.unauthorized, "$description (level $userLevel)", function(case)
        local user = { id = "user_1", level = case.userLevel }
        local ctx = { user = user, tenantId = "tenant_1" }
        
        _G.check.can_access = mock.fn(function(u, l)
          return u.level >= l
        end)
        
        local result = initiateTransfer.initiateTransfer(ctx)
        expect(result.success).toBe(false)
        expect(result.error).toBe("Supergod required")
      end)
    end)
  end)

  describe("confirmTransfer", function()
    describe("with valid parameters", function()
      it_each(cases.confirmTransfer.valid, "$description", function(case)
        local user = { id = "supergod_1", level = 6 }
        local ctx = { user = user, tenantId = case.tenantId, targetUserId = case.targetUserId }
        local result = confirmTransfer.confirmTransfer(ctx)
        expect(result.success).toBe(true)
        expect(result.action).toBe("transfer_ownership")
        expect(result.targetUserId).toBe(case.targetUserId)
      end)
    end)

    describe("missing target user", function()
      it_each(cases.confirmTransfer.missingTarget, "$description", function(case)
        local user = { id = "supergod_1", level = 6 }
        local ctx = { user = user, tenantId = case.tenantId, targetUserId = nil }
        local result = confirmTransfer.confirmTransfer(ctx)
        expect(result.success).toBe(false)
        expect(result.error).toBe("Target user required")
      end)
    end)

    describe("unauthorized", function()
      it_each(cases.confirmTransfer.unauthorized, "$description", function(case)
        local user = { id = "user_1", level = case.userLevel }
        local ctx = { user = user, tenantId = "tenant_1", targetUserId = "user_2" }
        
        _G.check.can_access = mock.fn(function(u, l)
          return u.level >= l
        end)
        
        local result = confirmTransfer.confirmTransfer(ctx)
        expect(result.success).toBe(false)
        expect(result.error).toBe("Supergod required")
      end)
    end)
  end)

  describe("assignGod", function()
    describe("with supergod permissions", function()
      it_each(cases.assignGod.authorized, "$description", function(case)
        local user = { id = "supergod_1", level = 6 }
        local ctx = { user = user, userId = case.targetUserId }
        local result = assignGod.assignGod(ctx)
        expect(result.success).toBe(true)
        expect(result.action).toBe("assign_god")
        expect(result.userId).toBe(case.targetUserId)
      end)
    end)

    describe("without supergod permissions", function()
      it_each(cases.assignGod.unauthorized, "$description", function(case)
        local user = { id = "user_1", level = case.userLevel }
        local ctx = { user = user, userId = "target_1" }
        
        _G.check.can_access = mock.fn(function(u, l)
          return u.level >= l
        end)
        
        local result = assignGod.assignGod(ctx)
        expect(result.success).toBe(false)
        expect(result.error).toBe("Supergod required")
      end)
    end)
  end)

end)

return {
  name = "transfer.test",
  description = "Tests for god-level transfer functions"
}
