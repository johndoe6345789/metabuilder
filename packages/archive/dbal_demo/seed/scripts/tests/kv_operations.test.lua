-- KV Operations Tests
-- Uses lua_test framework with parameterized test cases

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")
local beforeEach = require("lua_test.beforeEach")
local mock = require("lua_test.mock")

local cases = require("tests.kv_operations.cases")
local kv = require("kv_operations")

describe("kv_operations", function()
  -- Mock the global DBAL functions before each test
  beforeEach(function()
    _G.kv_set = mock.fn(function() return true end)
    _G.kv_get = mock.fn(function(key)
      if key == "existing_key" then return "stored_value" end
      return nil
    end)
    _G.kv_delete = mock.fn(function(key)
      return key == "existing_key"
    end)
  end)

  describe("set", function()
    it_each(cases.set.valid, "should store $key with $value", function(case)
      local result = kv.set(case.key, case.value, case.ttl)
      expect(result.success).toBe(true)
      expect(result.message).toContain(case.key)
      if case.ttl then
        expect(result.ttl).toBe(case.ttl)
      end
    end)

    it_each(cases.set.invalid, "should reject invalid input: $reason", function(case)
      local result = kv.set(case.key, case.value)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)

  describe("get", function()
    it_each(cases.get.found, "should retrieve $key successfully", function(case)
      _G.kv_get = mock.fn(function() return case.stored_value end)
      local result = kv.get(case.key)
      expect(result.success).toBe(true)
      expect(result.value).toBe(case.stored_value)
    end)

    it_each(cases.get.not_found, "should handle missing key: $key", function(case)
      _G.kv_get = mock.fn(function() return nil end)
      local result = kv.get(case.key)
      expect(result.success).toBe(false)
      expect(result.message).toContain("not found")
    end)

    it_each(cases.get.invalid, "should reject invalid key: $reason", function(case)
      local result = kv.get(case.key)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)

  describe("delete", function()
    it_each(cases.delete.success, "should delete $key", function(case)
      _G.kv_delete = mock.fn(function() return true end)
      local result = kv.delete(case.key)
      expect(result.success).toBe(true)
      expect(result.message).toContain(case.key)
    end)

    it_each(cases.delete.not_found, "should handle missing key: $key", function(case)
      _G.kv_delete = mock.fn(function() return false end)
      local result = kv.delete(case.key)
      expect(result.success).toBe(false)
    end)

    it_each(cases.delete.invalid, "should reject invalid key: $reason", function(case)
      local result = kv.delete(case.key)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)
end)

return {
  name = "kv_operations.test",
  description = "Tests for KV store operations"
}
