--- Validates script exports match metadata
---@param package_path string Path to the package
---@param metadata Metadata Package metadata
---@return string[] errors List of errors
---@return string[] warnings List of warnings
local function validate_script_exports(package_path, metadata)
  local errors = {}
  local warnings = {}

  if not metadata.exports or not metadata.exports.scripts then
    return errors, warnings
  end

  local scripts_path = package_path .. "/scripts"

  -- Check each exported script exists
  for _, script_name in ipairs(metadata.exports.scripts) do
    local script_file = scripts_path .. "/" .. script_name .. ".lua"

    -- Check if file exists
    local file = io.open(script_file, "r")
    if not file then
      table.insert(errors, "Exported script not found: " .. script_name .. ".lua")
    else
      file:close()
    end
  end

  return errors, warnings
end

return validate_script_exports
