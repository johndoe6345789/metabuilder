--- Structure validation facade
--- Re-exports structure validation functions for backward compatibility
---@module structure_validator

local structure_config = require("structure_config")
local validate_structure = require("validate_structure")
local validate_scripts_structure = require("validate_scripts_structure")
local validate_static_content = require("validate_static_content")
local validate_naming_conventions = require("validate_naming_conventions")
local validate_test_structure = require("validate_test_structure")
local validate_package_structure = require("validate_package_structure")

---@class StructureValidator
local M = {}

-- Structure configuration
M.REQUIRED_STRUCTURE = structure_config.REQUIRED
M.OPTIONAL_STRUCTURE = structure_config.OPTIONAL

-- Validation functions
M.validate_structure = validate_structure
M.validate_scripts_structure = validate_scripts_structure
M.validate_static_content = validate_static_content
M.check_orphaned_files = function(package_path, metadata)
  -- Placeholder for orphaned file checking
  return {}
end
M.validate_naming_conventions = validate_naming_conventions
M.validate_test_structure = validate_test_structure
M.validate_package_structure = validate_package_structure

return M
