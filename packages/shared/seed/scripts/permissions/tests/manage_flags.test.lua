-- Tests for feature flag management
-- Tests flag enable/disable and checking functions

local manageFlags = require("permissions.manage_flags")

describe("Feature Flag Management", function()

  before_each(function()
    -- Reset flags before each test
    manageFlags.initialize_flags({})
  end)

  describe("Flag initialization", function()
    it("should initialize flags with provided values", function()
      manageFlags.initialize_flags({
        flag1 = true,
        flag2 = false
      })
      assert.is_true(manageFlags.is_flag_enabled("flag1"))
      assert.is_false(manageFlags.is_flag_enabled("flag2"))
    end)

    it("should clear existing flags when reinitializing", function()
      manageFlags.enable_flag("test")
      manageFlags.initialize_flags({})
      assert.is_false(manageFlags.is_flag_enabled("test"))
    end)
  end)

  describe("Flag enable/disable", function()
    it("should enable a flag", function()
      manageFlags.enable_flag("feature_x")
      assert.is_true(manageFlags.is_flag_enabled("feature_x"))
    end)

    it("should disable a flag", function()
      manageFlags.enable_flag("feature_y")
      manageFlags.disable_flag("feature_y")
      assert.is_false(manageFlags.is_flag_enabled("feature_y"))
    end)

    it("should handle enabling already enabled flag", function()
      manageFlags.enable_flag("flag")
      manageFlags.enable_flag("flag")
      assert.is_true(manageFlags.is_flag_enabled("flag"))
    end)
  end)

  describe("Flag checking", function()
    it("should return false for undefined flags", function()
      assert.is_false(manageFlags.is_flag_enabled("undefined"))
    end)

    it("should return true only for enabled flags", function()
      manageFlags.enable_flag("enabled")
      manageFlags.disable_flag("disabled")
      assert.is_true(manageFlags.is_flag_enabled("enabled"))
      assert.is_false(manageFlags.is_flag_enabled("disabled"))
    end)
  end)

  describe("Get all flags", function()
    it("should return all flags", function()
      manageFlags.initialize_flags({
        flag1 = true,
        flag2 = false,
        flag3 = true
      })
      local flags = manageFlags.get_all_flags()
      assert.is_true(flags.flag1)
      assert.is_false(flags.flag2)
      assert.is_true(flags.flag3)
    end)

    it("should return a copy that doesn't affect internal state", function()
      manageFlags.enable_flag("test")
      local flags = manageFlags.get_all_flags()
      flags.test = false
      flags.new = true
      assert.is_true(manageFlags.is_flag_enabled("test"))
      assert.is_false(manageFlags.is_flag_enabled("new"))
    end)
  end)

  describe("Check required flags", function()
    it("should return true when all required flags are enabled", function()
      manageFlags.initialize_flags({
        flag1 = true,
        flag2 = true,
        flag3 = true
      })
      local allEnabled, missing = manageFlags.check_required_flags({"flag1", "flag2"})
      assert.is_true(allEnabled)
      assert.equals(0, #missing)
    end)

    it("should return false and list missing flags", function()
      manageFlags.initialize_flags({
        flag1 = true,
        flag2 = false
      })
      local allEnabled, missing = manageFlags.check_required_flags({"flag1", "flag2", "flag3"})
      assert.is_false(allEnabled)
      assert.equals(2, #missing)
      assert.is_true(missing[1] == "flag2" or missing[1] == "flag3")
    end)

    it("should return true for empty required flags list", function()
      local allEnabled, missing = manageFlags.check_required_flags({})
      assert.is_true(allEnabled)
      assert.equals(0, #missing)
    end)
  end)
end)
