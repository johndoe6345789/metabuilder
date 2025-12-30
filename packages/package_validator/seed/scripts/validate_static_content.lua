--- Validates static content structure
---@param package_path string Path to the package
---@param metadata Metadata Package metadata
---@return string[] errors List of errors
---@return string[] warnings List of warnings
local function validate_static_content(package_path, metadata)
  local errors = {}
  local warnings = {}

  if metadata.icon then
    local icon_path = package_path .. "/" .. metadata.icon
    local icon_file = io.open(icon_path, "r")

    if not icon_file then
      table.insert(errors, "Icon file not found: " .. metadata.icon)
    else
      icon_file:close()
    end
  else
    table.insert(warnings, "No icon defined in metadata")
  end

  return errors, warnings
end

return validate_static_content
