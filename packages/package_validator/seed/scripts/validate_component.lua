--- Validates a single component structure
---@param component Component The component to validate
---@param index? number Optional component index for error messages
---@return string[] errors List of validation errors
local function validate_component(component, index)
  local errors = {}
  local prefix = index and ("components[" .. index .. "]") or "component"

  -- Required fields
  if not component.id then
    table.insert(errors, prefix .. ": Missing required field 'id'")
  elseif type(component.id) ~= "string" then
    table.insert(errors, prefix .. ": 'id' must be a string")
  end

  if not component.type then
    table.insert(errors, prefix .. ": Missing required field 'type'")
  elseif type(component.type) ~= "string" then
    table.insert(errors, prefix .. ": 'type' must be a string")
  end

  -- Optional but recommended fields
  if component.name and type(component.name) ~= "string" then
    table.insert(errors, prefix .. ": 'name' must be a string")
  end

  if component.description and type(component.description) ~= "string" then
    table.insert(errors, prefix .. ": 'description' must be a string")
  end

  -- Validate props if present
  if component.props then
    if type(component.props) ~= "table" then
      table.insert(errors, prefix .. ": 'props' must be an object")
    end
  end

  -- Validate scripts if present
  if component.scripts then
    if type(component.scripts) ~= "table" then
      table.insert(errors, prefix .. ": 'scripts' must be an object")
    end
  end

  -- Validate bindings if present
  if component.bindings then
    if type(component.bindings) ~= "table" then
      table.insert(errors, prefix .. ": 'bindings' must be an object")
    else
      if component.bindings.dbal ~= nil and type(component.bindings.dbal) ~= "boolean" then
        table.insert(errors, prefix .. ": 'bindings.dbal' must be a boolean")
      end
      if component.bindings.browser ~= nil and type(component.bindings.browser) ~= "boolean" then
        table.insert(errors, prefix .. ": 'bindings.browser' must be a boolean")
      end
    end
  end

  return errors
end

return validate_component
