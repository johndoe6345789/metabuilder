-- Integration tests for the complete permission system
-- Tests package and component access with all features

local permissions = require("permissions.init")

describe("Permission System Integration", function()

  before_each(function()
    -- Reset state
    permissions.initialize_flags({})
    permissions.initialize_database(true)
  end)

  describe("Package access control", function()
    it("should check package access with all features", function()
      permissions.initialize_flags({
        advanced_mode = true
      })
      permissions.enable_database()

      local packagePerms = {
        enabled = true,
        minLevel = 3,
        databaseRequired = true,
        components = {}
      }

      local result = permissions.check_package_access(4, packagePerms)
      assert.is_true(result.allowed)
    end)

    it("should deny package access when disabled", function()
      local packagePerms = {
        enabled = false,
        minLevel = 1
      }

      local result = permissions.check_package_access(5, packagePerms)
      assert.is_false(result.allowed)
      assert.equals("Resource is currently disabled", result.reason)
    end)

    it("should deny package access when database is required but disabled", function()
      permissions.disable_database()

      local packagePerms = {
        enabled = true,
        minLevel = 2,
        databaseRequired = true
      }

      local result = permissions.check_package_access(3, packagePerms)
      assert.is_false(result.allowed)
      assert.is_truthy(string.find(result.reason, "Database"))
    end)
  end)

  describe("Component access control", function()
    it("should check component access with feature flags", function()
      permissions.enable_flag("beta_feature")

      local componentPerms = {
        enabled = true,
        minLevel = 2,
        featureFlags = {"beta_feature"}
      }

      local result = permissions.check_component_access(3, componentPerms)
      assert.is_true(result.allowed)
    end)

    it("should deny component access when flag is missing", function()
      permissions.disable_flag("required_flag")

      local componentPerms = {
        enabled = true,
        minLevel = 1,
        featureFlags = {"required_flag"}
      }

      local result = permissions.check_component_access(5, componentPerms)
      assert.is_false(result.allowed)
      assert.is_truthy(string.find(result.reason, "required_flag"))
    end)

    it("should check component with database requirement", function()
      permissions.enable_database()

      local componentPerms = {
        enabled = true,
        minLevel = 3,
        requireDatabase = true
      }

      local result = permissions.check_component_access(4, componentPerms)
      assert.is_true(result.allowed)
    end)
  end)

  describe("Real-world scenarios", function()
    it("should handle audit log package access", function()
      permissions.enable_database()

      local auditPackage = {
        enabled = true,
        minLevel = 3,
        databaseRequired = true
      }

      -- Moderator should have access
      local result = permissions.check_package_access(3, auditPackage)
      assert.is_true(result.allowed)

      -- Regular user should not
      result = permissions.check_package_access(2, auditPackage)
      assert.is_false(result.allowed)
      assert.equals(3, result.requiredLevel)
    end)

    it("should handle DBAL demo with feature flags", function()
      permissions.enable_database()
      permissions.enable_flag("kv_store_enabled")
      permissions.enable_flag("blob_storage_enabled")

      local kvPanel = {
        enabled = true,
        minLevel = 3,
        requireDatabase = true,
        featureFlags = {"kv_store_enabled"}
      }

      local blobPanel = {
        enabled = true,
        minLevel = 4,
        requireDatabase = true,
        featureFlags = {"blob_storage_enabled"}
      }

      -- Moderator can access KV panel
      local result = permissions.check_component_access(3, kvPanel)
      assert.is_true(result.allowed)

      -- But not blob panel (requires level 4)
      result = permissions.check_component_access(3, blobPanel)
      assert.is_false(result.allowed)

      -- Admin can access blob panel
      result = permissions.check_component_access(4, blobPanel)
      assert.is_true(result.allowed)
    end)

    it("should handle graceful degradation when database is disabled", function()
      permissions.disable_database()

      local dbRequiredComponent = {
        enabled = true,
        minLevel = 2,
        requireDatabase = true
      }

      local nonDbComponent = {
        enabled = true,
        minLevel = 2
      }

      -- Database-dependent component should be denied
      local result = permissions.check_component_access(3, dbRequiredComponent)
      assert.is_false(result.allowed)

      -- Non-database component should still work
      result = permissions.check_component_access(3, nonDbComponent)
      assert.is_true(result.allowed)
    end)
  end)

  describe("Edge cases", function()
    it("should handle level 0 (public) access", function()
      local publicResource = {
        enabled = true,
        minLevel = 0
      }

      local result = permissions.check_package_access(0, publicResource)
      assert.is_true(result.allowed)
    end)

    it("should handle level 6 (supergod) access", function()
      permissions.disable_database()

      local superGodResource = {
        enabled = true,
        minLevel = 6,
        databaseRequired = true
      }

      -- Even supergod respects database requirement
      local result = permissions.check_package_access(6, superGodResource)
      assert.is_false(result.allowed)
    end)

    it("should handle empty feature flags array", function()
      local componentPerms = {
        enabled = true,
        minLevel = 2,
        featureFlags = {}
      }

      local result = permissions.check_component_access(3, componentPerms)
      assert.is_true(result.allowed)
    end)
  end)
end)
