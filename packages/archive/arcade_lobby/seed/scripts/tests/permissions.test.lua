-- Permissions tests for arcade_lobby package
-- Tests can_create_tournament function with various roles

local permissions = require("permissions")

describe("Permissions", function()
  describe("can_create_tournament", function()
    it.each({
      { user = { role = "public" }, expected = false, desc = "public user" },
      { user = { role = "admin" }, expected = true, desc = "admin" },
      { user = { role = "god" }, expected = true, desc = "god" },
      { user = { role = "supergod" }, expected = true, desc = "supergod" },
      { user = {}, expected = false, desc = "no role defaults to public" },
    })("should return $expected for $desc", function(testCase)
      local result = permissions.can_create_tournament(testCase.user)
      expect(result).toBe(testCase.expected)
    end)
  end)
end)
