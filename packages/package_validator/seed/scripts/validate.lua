-- Main validation orchestrator
local metadata_schema = require("metadata_schema")
local component_schema = require("component_schema")
local structure_validator = require("structure_validator")
local lua_validator = require("lua_validator")

local M = {}

-- Validate a complete package
function M.validate_package(package_path, options)
  options = options or {}
  local results = {
    valid = true,
    errors = {},
    warnings = {}
  }

  -- Load and validate metadata.json
  local metadata_path = package_path .. "/metadata.json"
  local metadata_content = load_file(metadata_path)

  if not metadata_content then
    table.insert(results.errors, "Failed to load metadata.json")
    results.valid = false
    return results
  end

  local metadata = parse_json(metadata_content)
  if not metadata then
    table.insert(results.errors, "Failed to parse metadata.json")
    results.valid = false
    return results
  end

  -- 1. Validate metadata schema
  local metadata_valid, metadata_errors = metadata_schema.validate_metadata(metadata)
  if not metadata_valid then
    for _, err in ipairs(metadata_errors) do
      table.insert(results.errors, "metadata.json: " .. err)
    end
    results.valid = false
  end

  -- 2. Validate components.json
  local components_path = package_path .. "/components.json"
  local components_content = load_file(components_path)

  if components_content then
    local components = parse_json(components_content)
    if components then
      local components_valid, component_errors = component_schema.validate_components(components)
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
    local structure_results = structure_validator.validate_package_structure(package_path, metadata)
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
    local script_errors, script_warnings = lua_validator.validate_script_exports(package_path, metadata)
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

-- Validate just metadata
function M.validate_metadata_only(metadata)
  return metadata_schema.validate_metadata(metadata)
end

-- Validate just components
function M.validate_components_only(components)
  return component_schema.validate_components(components)
end

-- Format validation results for display
function M.format_results(results)
  local output = {}

  if results.valid then
    table.insert(output, "✓ Validation passed")
  else
    table.insert(output, "✗ Validation failed")
  end

  if #results.errors > 0 then
    table.insert(output, "\nErrors:")
    for _, err in ipairs(results.errors) do
      table.insert(output, "  • " .. err)
    end
  end

  if #results.warnings > 0 then
    table.insert(output, "\nWarnings:")
    for _, warn in ipairs(results.warnings) do
      table.insert(output, "  • " .. warn)
    end
  end

  return table.concat(output, "\n")
end

return M
