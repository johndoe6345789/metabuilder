local validate_metadata = require("validate_metadata")
local validate_components = require("validate_components")
local validate_package_structure = require("validate_package_structure")
local validate_script_exports = require("validate_script_exports")
local format_results = require("format_results")

--- Validates a complete package
---@param package_path string Path to the package
---@param options? ValidationOptions Validation options
---@return ValidationResult results Validation results
local function validate_package(package_path, options)
  options = options or {}
  local results = {
    valid = true,
    errors = {},
    warnings = {}
  }

  -- Load and validate metadata.json
  local metadata_path = package_path .. "/metadata.json"
  local metadata_file = io.open(metadata_path, "r")

  if not metadata_file then
    table.insert(results.errors, "Failed to load metadata.json")
    results.valid = false
    return results
  end

  local metadata_content = metadata_file:read("*a")
  metadata_file:close()

  -- Parse JSON (using global parse_json if available)
  local metadata = parse_json and parse_json(metadata_content) or nil
  if not metadata then
    table.insert(results.errors, "Failed to parse metadata.json")
    results.valid = false
    return results
  end

  -- 1. Validate metadata schema
  local metadata_valid, metadata_errors = validate_metadata(metadata)
  if not metadata_valid then
    for _, err in ipairs(metadata_errors) do
      table.insert(results.errors, "metadata.json: " .. err)
    end
    results.valid = false
  end

  -- 2. Validate components.json
  local components_path = package_path .. "/components.json"
  local components_file = io.open(components_path, "r")

  if components_file then
    local components_content = components_file:read("*a")
    components_file:close()
    local components = parse_json and parse_json(components_content) or nil
    if components then
      local components_valid, component_errors = validate_components(components)
      if not components_valid then
        for _, err in ipairs(component_errors) do
          table.insert(results.errors, "components.json: " .. err)
        end
        results.valid = false
      end
    else
      table.insert(results.errors, "Failed to parse components.json")
      results.valid = false
    end
  else
    table.insert(results.warnings, "components.json not found (optional)")
  end

  -- 3. Validate folder structure
  if not options.skipStructure then
    local structure_results = validate_package_structure(package_path, metadata)
    if not structure_results.valid then
      results.valid = false
    end
    for _, err in ipairs(structure_results.errors) do
      table.insert(results.errors, "Structure: " .. err)
    end
    for _, warn in ipairs(structure_results.warnings) do
      table.insert(results.warnings, "Structure: " .. warn)
    end
  end

  -- 4. Validate Lua script exports
  if not options.skipLua and metadata.exports and metadata.exports.scripts then
    local script_errors, script_warnings = validate_script_exports(package_path, metadata)
    for _, err in ipairs(script_errors) do
      table.insert(results.errors, "Lua: " .. err)
      results.valid = false
    end
    for _, warn in ipairs(script_warnings) do
      table.insert(results.warnings, "Lua: " .. warn)
    end
  end

  return results
end

--- Validates just metadata
---@param metadata Metadata Metadata to validate
---@return boolean valid Whether metadata is valid
---@return string[] errors List of errors
local function validate_metadata_only(metadata)
  return validate_metadata(metadata)
end

--- Validates just components
---@param components Component[] Components to validate
---@return boolean valid Whether components are valid
---@return string[] errors List of errors
local function validate_components_only(components)
  return validate_components(components)
end

-- Return module with all functions
return {
  validate_package = validate_package,
  validate_metadata_only = validate_metadata_only,
  validate_components_only = validate_components_only,
  format_results = format_results
}
