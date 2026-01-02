---@class PackageConfig
---@field enabled boolean Whether the package is enabled
---@field required_level number Minimum permission level required to access
---@field features table<string, boolean> Feature flags for the package
---@field database_enabled boolean Whether database access is enabled
---@field components table<string, ComponentConfig> Component-specific configuration

---@class ComponentConfig
---@field enabled boolean Whether the component is enabled
---@field required_level number|nil Minimum permission level (inherits from package if nil)
---@field props table|nil Default props for the component

---@class FeatureFlag
---@field name string Feature flag name
---@field enabled boolean Whether the feature is enabled
---@field description string Feature description
---@field required_level number Minimum permission level to toggle

---@class DatabaseConfig
---@field enabled boolean Whether database is enabled
---@field connection string|nil Database connection string
---@field pool_size number|nil Connection pool size
---@field timeout number|nil Query timeout in milliseconds

local M = {}

---Create default package configuration
---@param package_name string The package name
---@param required_level number|nil Minimum permission level (default: 1 - USER)
---@return PackageConfig config Default package configuration
function M.create_package_config(package_name, required_level)
  return {
    enabled = true,
    required_level = required_level or 1,
    features = {},
    database_enabled = false,
    components = {}
  }
end

---Check if a package is enabled
---@param config PackageConfig The package configuration
---@return boolean enabled True if package is enabled
function M.is_package_enabled(config)
  return config.enabled == true
end

---Check if a component is enabled
---@param package_config PackageConfig The package configuration
---@param component_id string The component ID
---@return boolean enabled True if component is enabled
function M.is_component_enabled(package_config, component_id)
  if not M.is_package_enabled(package_config) then
    return false
  end

  local component_config = package_config.components[component_id]
  if not component_config then
    return true -- Components enabled by default if no specific config
  end

  return component_config.enabled ~= false
end

---Get required permission level for a component
---@param package_config PackageConfig The package configuration
---@param component_id string The component ID
---@return number required_level The required permission level
function M.get_component_level(package_config, component_id)
  local component_config = package_config.components[component_id]
  if component_config and component_config.required_level then
    return component_config.required_level
  end
  return package_config.required_level
end

---Check if a feature is enabled
---@param config PackageConfig The package configuration
---@param feature_name string The feature name
---@return boolean enabled True if feature is enabled
function M.is_feature_enabled(config, feature_name)
  return config.features[feature_name] == true
end

---Enable or disable a feature
---@param config PackageConfig The package configuration
---@param feature_name string The feature name
---@param enabled boolean Whether to enable the feature
---@return PackageConfig config Updated configuration
function M.set_feature(config, feature_name, enabled)
  config.features[feature_name] = enabled
  return config
end

---Enable or disable database access
---@param config PackageConfig The package configuration
---@param enabled boolean Whether to enable database access
---@return PackageConfig config Updated configuration
function M.set_database_enabled(config, enabled)
  config.database_enabled = enabled
  return config
end

---Merge two configurations (deep merge)
---@param base PackageConfig Base configuration
---@param override PackageConfig Override configuration
---@return PackageConfig merged Merged configuration
function M.merge_config(base, override)
  local merged = {}

  -- Copy base
  for k, v in pairs(base) do
    merged[k] = v
  end

  -- Override values
  for k, v in pairs(override) do
    if type(v) == "table" and type(merged[k]) == "table" then
      merged[k] = M.merge_config(merged[k], v)
    else
      merged[k] = v
    end
  end

  return merged
end

---Validate package configuration
---@param config table The configuration to validate
---@return boolean valid True if configuration is valid
---@return string|nil error Error message if invalid
function M.validate_config(config)
  if type(config) ~= "table" then
    return false, "Configuration must be a table"
  end

  if type(config.enabled) ~= "boolean" then
    return false, "config.enabled must be a boolean"
  end

  if type(config.required_level) ~= "number" then
    return false, "config.required_level must be a number"
  end

  if config.required_level < 0 or config.required_level > 5 then
    return false, "config.required_level must be between 0 and 5"
  end

  if type(config.features) ~= "table" then
    return false, "config.features must be a table"
  end

  if type(config.database_enabled) ~= "boolean" then
    return false, "config.database_enabled must be a boolean"
  end

  if type(config.components) ~= "table" then
    return false, "config.components must be a table"
  end

  return true, nil
end

return M
