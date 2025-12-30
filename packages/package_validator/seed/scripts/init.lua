--- Schema Validator initialization
--- Package validator entry point providing validation utilities
---@module init

local validate = require("validate")

---@class PackageValidator
local M = {}

--- Initialize the validator
---@return { name: string, version: string, description: string } info Validator info
function M.init()
  return {
    name = "Schema Validator",
    version = "1.0.0",
    description = "Validates package JSON schemas"
  }
end

--- Main validation entry point
---@param package_id string Package identifier to validate
---@return ValidationResult results Validation results
function M.validate_package(package_id)
  local package_path = "packages/" .. package_id .. "/seed"
  return validate.validate_package(package_path)
end

--- Quick validation for metadata
---@param metadata Metadata Metadata to validate
---@return boolean valid Whether valid
---@return string[] errors List of errors
function M.validate_metadata(metadata)
  return validate.validate_metadata_only(metadata)
end

--- Quick validation for components
---@param components Component[] Components to validate
---@return boolean valid Whether valid
---@return string[] errors List of errors
function M.validate_components(components)
  return validate.validate_components_only(components)
end

return M
