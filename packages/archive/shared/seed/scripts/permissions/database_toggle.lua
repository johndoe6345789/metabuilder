-- Database toggle control
-- Functions for managing database availability state

---@class DatabaseToggle
local M = {}

-- Internal database state
local databaseEnabled = true

---Initialize database state
---@param enabled? boolean Initial database state (default: true)
function M.initialize_database(enabled)
  databaseEnabled = enabled ~= false
end

---Enable database access
function M.enable_database()
  databaseEnabled = true
end

---Disable database access
function M.disable_database()
  databaseEnabled = false
end

---Check if database is enabled
---@return boolean enabled Whether database is enabled
function M.is_database_enabled()
  return databaseEnabled
end

---Enforce database requirement
---@param resourceName? string Name of resource requiring database
---@return boolean success Returns true if database is enabled
function M.require_database(resourceName)
  if not databaseEnabled then
    local resource = resourceName or "this operation"
    error(string.format(
      "Database access required for %s but database is disabled",
      resource
    ))
  end
  return true
end

---Get database status with metadata
---@return table status Database status information
function M.get_database_status()
  return {
    enabled = databaseEnabled,
    message = databaseEnabled and "Database is enabled" or "Database is disabled"
  }
end

return M
