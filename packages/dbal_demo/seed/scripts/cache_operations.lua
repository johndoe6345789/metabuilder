-- Cache Operations

---@class CacheSaveResult
---@field success boolean Whether save succeeded
---@field message string Status message
---@field key string The cache key
---@field ttl number Time to live in seconds
---@field error string? Error message if failed

---@class CacheGetResult
---@field success boolean Whether get succeeded
---@field data any? The cached data
---@field message string Status message (hit/miss)
---@field error string? Error message if failed

---@class CacheClearResult
---@field success boolean Whether clear succeeded
---@field message string Status message
---@field error string? Error message if failed

---@class UserPreferences
---@field theme string Color theme ("dark" | "light")
---@field language string Language code
---@field notifications boolean Whether notifications enabled

---@class PreferencesResult
---@field success boolean Whether operation succeeded
---@field preferences UserPreferences The user preferences
---@field is_default boolean? Whether returning defaults

---@class CacheModule
---@field save fun(key: string, data: any, ttl: number?): CacheSaveResult Save to cache
---@field get fun(key: string): CacheGetResult Get from cache
---@field clear fun(key: string): CacheClearResult Clear cached data
---@field save_preferences fun(prefs: UserPreferences?): CacheSaveResult Save user prefs
---@field get_preferences fun(): PreferencesResult Get user prefs

---@type CacheModule
local M = {}

---Save data to cache
---@param key string The cache key
---@param data any The data to cache
---@param ttl number? Time to live in seconds (default 3600)
---@return CacheSaveResult
function M.save(key, data, ttl)
  if not key or key == "" then
    return { success = false, error = "Cache key is required" }
  end
  
  ttl = ttl or 3600 -- Default 1 hour TTL
  
  cache_set(key, data, ttl)
  
  return {
    success = true,
    message = "Data cached with TTL: " .. ttl .. "s",
    key = key,
    ttl = ttl
  }
end

---Get cached data
---@param key string The cache key
---@return CacheGetResult
function M.get(key)
  if not key or key == "" then
    return { success = false, error = "Cache key is required" }
  end
  
  local data = cache_get(key)
  if data then
    return {
      success = true,
      data = data,
      message = "Cache hit"
    }
  else
    return {
      success = false,
      message = "Cache miss"
    }
  end
end

---Clear cached data
---@param key string The cache key
---@return CacheClearResult
function M.clear(key)
  if not key or key == "" then
    return { success = false, error = "Cache key is required" }
  end
  
  cache_clear(key)
  
  return {
    success = true,
    message = "Cache cleared: " .. key
  }
end

---Save user preferences (common use case)
---@param prefs UserPreferences? User preferences to save
---@return CacheSaveResult
function M.save_preferences(prefs)
  prefs = prefs or {}
  
  local data = {
    theme = prefs.theme or "dark",
    language = prefs.language or "en",
    notifications = prefs.notifications ~= false
  }
  
  return M.save("user-preferences", data, 3600)
end

---Get user preferences
---@return PreferencesResult
function M.get_preferences()
  local result = M.get("user-preferences")
  if result.success then
    return {
      success = true,
      preferences = result.data
    }
  else
    -- Return defaults
    return {
      success = true,
      preferences = {
        theme = "dark",
        language = "en",
        notifications = true
      },
      is_default = true
    }
  end
end

return M
