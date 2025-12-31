local structure_config = require("structure_config")

--- Validates basic folder structure
---@param package_path string Path to the package
---@return string[] errors List of errors
---@return string[] warnings List of warnings
local function validate_structure(package_path)
  local errors = {}
  local warnings = {}

  -- Check required files
  for path, _ in pairs(structure_config.REQUIRED) do
    local full_path = package_path .. "/" .. path
    local file = io.open(full_path, "r")

    if not file then
      table.insert(errors, "Required file missing: " .. path)
    else
      file:close()
    end
  end

  -- Check optional but recommended files
  for path, file_type in pairs(structure_config.OPTIONAL) do
    local full_path = package_path .. "/" .. path

    if file_type == "file" then
      local file = io.open(full_path, "r")
      if not file then
        table.insert(warnings, "Recommended file missing: " .. path)
      else
        file:close()
      end
    elseif file_type == "directory" then
      -- Note: Directory checking would be done with OS-specific commands
      -- This is a placeholder for the pattern
    end
  end

  return errors, warnings
end

return validate_structure
