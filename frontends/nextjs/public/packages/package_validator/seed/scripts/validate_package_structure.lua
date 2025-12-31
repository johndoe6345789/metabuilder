local validate_structure = require("validate_structure")
local validate_scripts_structure = require("validate_scripts_structure")
local validate_static_content = require("validate_static_content")
local validate_naming_conventions = require("validate_naming_conventions")
local validate_test_structure = require("validate_test_structure")

--- Validates complete package structure
---@param package_path string Path to the package
---@param metadata Metadata Package metadata
---@return ValidationResult results Validation results
local function validate_package_structure(package_path, metadata)
  local results = {
    valid = true,
    errors = {},
    warnings = {}
  }

  -- Basic structure
  local struct_errors, struct_warnings = validate_structure(package_path)
  for _, err in ipairs(struct_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(struct_warnings) do
    table.insert(results.warnings, warn)
  end

  -- Scripts structure
  local script_errors, script_warnings = validate_scripts_structure(package_path, metadata)
  for _, err in ipairs(script_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(script_warnings) do
    table.insert(results.warnings, warn)
  end

  -- Static content
  local static_errors, static_warnings = validate_static_content(package_path, metadata)
  for _, err in ipairs(static_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(static_warnings) do
    table.insert(results.warnings, warn)
  end

  -- Naming conventions
  local naming_errors, naming_warnings = validate_naming_conventions(package_path, metadata)
  for _, err in ipairs(naming_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(naming_warnings) do
    table.insert(results.warnings, warn)
  end

  -- Test structure (only if lua_test is a devDependency)
  local test_errors, test_warnings = validate_test_structure(package_path, metadata)
  for _, err in ipairs(test_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(test_warnings) do
    table.insert(results.warnings, warn)
  end

  return results
end

return validate_package_structure
