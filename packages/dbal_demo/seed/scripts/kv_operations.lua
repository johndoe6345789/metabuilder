-- KV Store Operations
local M = {}

-- Set a key-value pair
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

-- Get a value by key
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

-- Delete a key
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

-- Add items to a list
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

-- Get list items
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
