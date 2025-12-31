-- Feature flag management
-- Functions for managing and checking feature flags

---@class ManageFlags
local M = {}

-- Internal feature flag state
local featureFlags = {}

---Initialize feature flags
---@param flags table<string, boolean> Initial flag states
function M.initialize_flags(flags)
  featureFlags = flags or {}
end

---Enable a feature flag
---@param flagName string Name of the flag to enable
function M.enable_flag(flagName)
  featureFlags[flagName] = true
end

---Disable a feature flag
---@param flagName string Name of the flag to disable
function M.disable_flag(flagName)
  featureFlags[flagName] = false
end

---Check if a feature flag is enabled
---@param flagName string Name of the flag to check
---@return boolean enabled Whether the flag is enabled
function M.is_flag_enabled(flagName)
  return featureFlags[flagName] == true
end

---Get all feature flags
---@return table<string, boolean> All feature flags
function M.get_all_flags()
  -- Return a copy to prevent external modification
  local copy = {}
  for k, v in pairs(featureFlags) do
    copy[k] = v
  end
  return copy
end

---Check if all required flags are enabled
---@param requiredFlags string[] List of required flag names
---@return boolean allEnabled Whether all flags are enabled
---@return string[] missingFlags List of missing/disabled flags
function M.check_required_flags(requiredFlags)
  local missing = {}
  for _, flag in ipairs(requiredFlags) do
    if not M.is_flag_enabled(flag) then
      table.insert(missing, flag)
    end
  end
  return #missing == 0, missing
end

return M
