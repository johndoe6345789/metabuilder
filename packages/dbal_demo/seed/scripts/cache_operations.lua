-- Cache Operations
local M = {}

-- Save data to cache
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

-- Get cached data
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

-- Clear cached data
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

-- Save user preferences (common use case)
function M.save_preferences(prefs)
  prefs = prefs or {}
  
  local data = {
    theme = prefs.theme or "dark",
    language = prefs.language or "en",
    notifications = prefs.notifications ~= false
  }
  
  return M.save("user-preferences", data, 3600)
end

-- Get user preferences
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
