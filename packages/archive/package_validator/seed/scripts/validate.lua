--- Main validation orchestrator facade
--- Re-exports validation functions for backward compatibility
---@module validate

local validate_package_module = require("validate_package")

---@class Validate
local M = {}

M.validate_package = validate_package_module.validate_package
M.validate_metadata_only = validate_package_module.validate_metadata_only
M.validate_components_only = validate_package_module.validate_components_only
M.format_results = validate_package_module.format_results

return M
