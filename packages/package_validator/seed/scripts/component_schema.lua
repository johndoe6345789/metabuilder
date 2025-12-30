-- Component JSON schema definitions
local M = {}

-- Validate a single component structure
function M.validate_component(component, index)
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

  -- Validate layout if present
  if component.layout then
    if type(component.layout) ~= "table" then
      table.insert(errors, prefix .. ": 'layout' must be an object")
    else
      local layout_errors = M.validate_layout(component.layout, prefix .. ".layout")
      for _, err in ipairs(layout_errors) do
        table.insert(errors, err)
      end
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

-- Validate layout structure recursively
function M.validate_layout(layout, path)
  local errors = {}

  if not layout.type then
    table.insert(errors, path .. ": Missing required field 'type'")
  elseif type(layout.type) ~= "string" then
    table.insert(errors, path .. ": 'type' must be a string")
  end

  if layout.props and type(layout.props) ~= "table" then
    table.insert(errors, path .. ": 'props' must be an object")
  end

  if layout.children then
    if type(layout.children) ~= "table" then
      table.insert(errors, path .. ": 'children' must be an array")
    else
      for i, child in ipairs(layout.children) do
        if type(child) == "table" then
          local child_errors = M.validate_layout(child, path .. ".children[" .. i .. "]")
          for _, err in ipairs(child_errors) do
            table.insert(errors, err)
          end
        end
      end
    end
  end

  return errors
end

-- Validate components.json (array of components)
function M.validate_components(components)
  local errors = {}

  if type(components) ~= "table" then
    table.insert(errors, "components.json must be an array")
    return false, errors
  end

  -- Validate each component
  for i, component in ipairs(components) do
    local comp_errors = M.validate_component(component, i)
    for _, err in ipairs(comp_errors) do
      table.insert(errors, err)
    end
  end

  return #errors == 0, errors
end

return M
