--- Validates naming conventions
---@param package_path string Path to the package
---@param metadata Metadata Package metadata
---@return string[] errors List of errors
---@return string[] warnings List of warnings
local function validate_naming_conventions(package_path, metadata)
  local errors = {}
  local warnings = {}

  -- Package directory should match packageId
  local dir_name = package_path:match("([^/]+)$")
  if dir_name ~= metadata.packageId then
    table.insert(errors, "Package directory name '" .. dir_name .. "' does not match packageId '" .. metadata.packageId .. "'")
  end

  -- Check script file naming
  if metadata.exports and metadata.exports.scripts then
    for _, script_name in ipairs(metadata.exports.scripts) do
      -- Script names should be lowercase with underscores
      if not string.match(script_name, "^[a-z_]+$") then
        table.insert(warnings, "Script name '" .. script_name .. "' should use lowercase and underscores only")
      end
    end
  end

  -- Check component naming
  if metadata.exports and metadata.exports.components then
    for _, component_name in ipairs(metadata.exports.components) do
      -- Component names can be PascalCase or snake_case
      local is_valid = string.match(component_name, "^[A-Z][a-zA-Z]+$") or
                      string.match(component_name, "^[a-z_]+$")
      if not is_valid then
        table.insert(warnings, "Component name '" .. component_name .. "' should use PascalCase or snake_case")
      end
    end
  end

  return errors, warnings
end

return validate_naming_conventions
