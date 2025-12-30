--- Validates layout structure recursively
---@param layout ComponentLayout The layout to validate
---@param path string The current path for error messages
---@return string[] errors List of validation errors
local function validate_layout(layout, path)
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
          local child_errors = validate_layout(child, path .. ".children[" .. i .. "]")
          for _, err in ipairs(child_errors) do
            table.insert(errors, err)
          end
        end
      end
    end
  end

  return errors
end

return validate_layout
