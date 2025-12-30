-- Cache Operations Tests
-- Uses lua_test framework with parameterized test cases

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")
local beforeEach = require("lua_test.beforeEach")
local mock = require("lua_test.mock")

local cases = require("tests.cache_operations.cases")
local cache = require("cache_operations")

describe("cache_operations", function()
  -- Mock the global cache functions before each test
  beforeEach(function()
    _G.cache_set = mock.fn(function() return true end)
    _G.cache_get = mock.fn(function(key)
      if key == "existing_cache" then return { cached = true } end
      return nil
    end)
    _G.cache_clear = mock.fn(function() return true end)
  end)

  describe("save", function()
    it_each(cases.save.valid, "should cache $key with TTL $ttl", function(case)
      local result = cache.save(case.key, case.data, case.ttl)
      expect(result.success).toBe(true)
      expect(result.key).toBe(case.key)
      if case.ttl then
        expect(result.ttl).toBe(case.ttl)
      else
        expect(result.ttl).toBe(3600) -- default TTL
      end
    end)

    it_each(cases.save.invalid, "should reject invalid input: $reason", function(case)
      local result = cache.save(case.key, case.data)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)

  describe("get", function()
    it_each(cases.get.hit, "should return cached data for $key", function(case)
      _G.cache_get = mock.fn(function() return case.cached_data end)
      local result = cache.get(case.key)
      expect(result.success).toBe(true)
      expect(result.message).toBe("Cache hit")
      expect(result.data).toEqual(case.cached_data)
    end)

    it_each(cases.get.miss, "should report cache miss for $key", function(case)
      _G.cache_get = mock.fn(function() return nil end)
      local result = cache.get(case.key)
      expect(result.success).toBe(false)
      expect(result.message).toBe("Cache miss")
    end)

    it_each(cases.get.invalid, "should reject invalid key: $reason", function(case)
      local result = cache.get(case.key)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)

  describe("clear", function()
    it_each(cases.clear.success, "should clear cache for $key", function(case)
      local result = cache.clear(case.key)
      expect(result.success).toBe(true)
      expect(result.message).toContain(case.key)
    end)

    it_each(cases.clear.invalid, "should reject invalid key: $reason", function(case)
      local result = cache.clear(case.key)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    end)
  end)

  describe("save_preferences", function()
    it_each(cases.preferences.valid, "should save preferences: $theme/$language", function(case)
      local result = cache.save_preferences(case.prefs)
      expect(result.success).toBe(true)
      expect(result.key).toBe("user_preferences")
    end)
  end)

  describe("get_preferences", function()
    it("should return cached preferences", function()
      local prefs = { theme = "dark", language = "en", notifications = true }
      _G.cache_get = mock.fn(function() return prefs end)
      local result = cache.get_preferences()
      expect(result.success).toBe(true)
      expect(result.preferences.theme).toBe("dark")
    end)

    it("should return defaults when no cache", function()
      _G.cache_get = mock.fn(function() return nil end)
      local result = cache.get_preferences()
      expect(result.success).toBe(true)
      expect(result.is_default).toBe(true)
      expect(result.preferences.theme).toBe("light")
    end)
  end)
end)

return {
  name = "cache_operations.test",
  description = "Tests for cache operations"
}
