-- Tests for permission access checking
-- Tests check_access function with various scenarios

local checkAccess = require("permissions.check_access")

describe("Permission Access Checking", function()

  describe("Basic access checks", function()
    it("should allow access when user level meets requirement", function()
      local result = checkAccess.check_access(3, {
        enabled = true,
        minLevel = 2
      })
      assert.is_true(result.allowed)
      assert.is_nil(result.reason)
    end)

    it("should deny access when user level is too low", function()
      local result = checkAccess.check_access(1, {
        enabled = true,
        minLevel = 3
      })
      assert.is_false(result.allowed)
      assert.equals("Insufficient permission level", result.reason)
      assert.equals(3, result.requiredLevel)
    end)

    it("should deny access when resource is disabled", function()
      local result = checkAccess.check_access(5, {
        enabled = false,
        minLevel = 1
      })
      assert.is_false(result.allowed)
      assert.equals("Resource is currently disabled", result.reason)
    end)
  end)

  describe("Database requirements", function()
    it("should allow access when database is enabled and required", function()
      local result = checkAccess.check_access(3, {
        enabled = true,
        minLevel = 2,
        databaseRequired = true
      }, {}, true)
      assert.is_true(result.allowed)
    end)

    it("should deny access when database is disabled but required", function()
      local result = checkAccess.check_access(3, {
        enabled = true,
        minLevel = 2,
        databaseRequired = true
      }, {}, false)
      assert.is_false(result.allowed)
      assert.equals("Database is required but not enabled", result.reason)
    end)

    it("should allow access when database is disabled and not required", function()
      local result = checkAccess.check_access(3, {
        enabled = true,
        minLevel = 2
      }, {}, false)
      assert.is_true(result.allowed)
    end)
  end)

  describe("Feature flags", function()
    it("should allow access when all required flags are enabled", function()
      local result = checkAccess.check_access(3, {
        enabled = true,
        minLevel = 2,
        featureFlags = {"flag1", "flag2"}
      }, {
        flag1 = true,
        flag2 = true
      })
      assert.is_true(result.allowed)
    end)

    it("should deny access when required flag is missing", function()
      local result = checkAccess.check_access(3, {
        enabled = true,
        minLevel = 2,
        featureFlags = {"flag1", "flag2"}
      }, {
        flag1 = true,
        flag2 = false
      })
      assert.is_false(result.allowed)
      assert.equals("Required feature flag 'flag2' is not enabled", result.reason)
    end)

    it("should allow access when no flags are required", function()
      local result = checkAccess.check_access(3, {
        enabled = true,
        minLevel = 2
      }, {})
      assert.is_true(result.allowed)
    end)
  end)

  describe("Combined checks", function()
    it("should pass all checks when all requirements are met", function()
      local result = checkAccess.check_access(5, {
        enabled = true,
        minLevel = 4,
        databaseRequired = true,
        featureFlags = {"advanced_mode"}
      }, {
        advanced_mode = true
      }, true)
      assert.is_true(result.allowed)
    end)

    it("should fail on first check that doesn't pass", function()
      local result = checkAccess.check_access(3, {
        enabled = false,
        minLevel = 4,
        databaseRequired = true
      }, {}, true)
      assert.is_false(result.allowed)
      assert.equals("Resource is currently disabled", result.reason)
    end)
  end)
end)
