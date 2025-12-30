local validate_component = require("validate_component")

--- Validates components.json (array of components)
---@param components Component[] Array of component definitions
---@return boolean valid Whether all components are valid
---@return string[] errors List of validation errors
local function validate_components(components)
  local errors = {}

  if type(components) ~= "table" then
    table.insert(errors, "components.json must be an array")
    return false, errors
  end

  -- Validate each component
  for i, component in ipairs(components) do
    local comp_errors = validate_component(component, i)
    for _, err in ipairs(comp_errors) do
      table.insert(errors, err)
    end
  end

  return #errors == 0, errors
end

return validate_components
