-- Schema Validator initialization
local validate = require("validate")

local M = {}

-- Initialize the validator
function M.init()
  return {
    name = "Schema Validator",
    version = "1.0.0",
    description = "Validates package JSON schemas"
  }
end

-- Main validation entry point
function M.validate_package(package_id)
  local package_path = "packages/" .. package_id .. "/seed"
  return validate.validate_package(package_path)
end

-- Quick validation for metadata
function M.validate_metadata(metadata)
  return validate.validate_metadata_only(metadata)
end

-- Quick validation for components
function M.validate_components(components)
  return validate.validate_components_only(components)
end

return M
