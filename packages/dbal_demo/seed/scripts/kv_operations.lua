-- KV Store Operations

---@class KVSetResult
---@field success boolean Whether set succeeded
---@field message string Status message
---@field ttl number? Time to live in seconds
---@field error string? Error message if failed

---@class KVGetResult
---@field success boolean Whether get succeeded
---@field value any? The retrieved value
---@field message string Status message
---@field error string? Error message if failed

---@class KVDeleteResult
---@field success boolean Whether delete succeeded
---@field message string Status message
---@field error string? Error message if failed

---@class KVListAddResult
---@field success boolean Whether add succeeded
---@field message string Status message
---@field items string[] Items that were added
---@field error string? Error message if failed

---@class KVListGetResult
---@field success boolean Whether get succeeded
---@field items string[] The list items
---@field count number Number of items
---@field message string Status message
---@field error string? Error message if failed

---@class KVModule
---@field set fun(key: string, value: any, ttl: number?): KVSetResult Set a key-value pair
---@field get fun(key: string): KVGetResult Get a value by key
---@field delete fun(key: string): KVDeleteResult Delete a key
---@field list_add fun(key: string, items: string[]?): KVListAddResult Add items to a list
---@field list_get fun(key: string): KVListGetResult Get list items

---@type KVModule
local M = {}

---Set a key-value pair
---@param key string The key to set
---@param value any The value to store
---@param ttl number? Optional time to live in seconds
---@return KVSetResult
function M.set(key, value, ttl)
  if not key or key == "" then
    return { success = false, error = "Key is required" }
  end
  
  local result = kv_set(key, value, ttl)
  return {
    success = true,
    message = "Stored: " .. key .. " = " .. tostring(value),
    ttl = ttl
  }
end

---Get a value by key
---@param key string The key to retrieve
---@return KVGetResult
function M.get(key)
  if not key or key == "" then
    return { success = false, error = "Key is required" }
  end
  
  local value = kv_get(key)
  if value then
    return {
      success = true,
      value = value,
      message = "Retrieved: " .. tostring(value)
    }
  else
    return {
      success = false,
      message = "Key not found"
    }
  end
end

---Delete a key
---@param key string The key to delete
---@return KVDeleteResult
function M.delete(key)
  if not key or key == "" then
    return { success = false, error = "Key is required" }
  end
  
  local deleted = kv_delete(key)
  if deleted then
    return {
      success = true,
      message = "Deleted: " .. key
    }
  else
    return {
      success = false,
      message = "Key not found"
    }
  end
end

---Add items to a list
---@param key string The list key
---@param items string[]? Items to add (defaults to sample items)
---@return KVListAddResult
function M.list_add(key, items)
  if not key or key == "" then
    return { success = false, error = "List key is required" }
  end
  
  items = items or { "Item 1", "Item 2", "Item 3" }
  kv_list_add(key, items)
  
  return {
    success = true,
    message = "Added " .. #items .. " items to list",
    items = items
  }
end

---Get list items
---@param key string The list key
---@return KVListGetResult
function M.list_get(key)
  if not key or key == "" then
    return { success = false, error = "List key is required" }
  end
  
  local items = kv_list_get(key)
  return {
    success = true,
    items = items,
    count = #items,
    message = "Retrieved " .. #items .. " items"
  }
end

return M
