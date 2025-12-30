--- Validates package metadata.json structure
---@param metadata Metadata The metadata object to validate
---@return boolean valid Whether the metadata is valid
---@return string[] errors List of validation errors
local function validate_metadata(metadata)
  local errors = {}

  -- Required fields
  if not metadata.packageId then
    table.insert(errors, "Missing required field: packageId")
  elseif type(metadata.packageId) ~= "string" then
    table.insert(errors, "packageId must be a string")
  elseif not string.match(metadata.packageId, "^[a-z_]+$") then
    table.insert(errors, "packageId must contain only lowercase letters and underscores")
  end

  if not metadata.name then
    table.insert(errors, "Missing required field: name")
  elseif type(metadata.name) ~= "string" then
    table.insert(errors, "name must be a string")
  end

  if not metadata.version then
    table.insert(errors, "Missing required field: version")
  elseif type(metadata.version) ~= "string" then
    table.insert(errors, "version must be a string")
  elseif not string.match(metadata.version, "^%d+%.%d+%.%d+$") then
    table.insert(errors, "version must follow semantic versioning (e.g., 1.0.0)")
  end

  if not metadata.description then
    table.insert(errors, "Missing required field: description")
  elseif type(metadata.description) ~= "string" then
    table.insert(errors, "description must be a string")
  end

  if not metadata.author then
    table.insert(errors, "Missing required field: author")
  elseif type(metadata.author) ~= "string" then
    table.insert(errors, "author must be a string")
  end

  if not metadata.category then
    table.insert(errors, "Missing required field: category")
  elseif type(metadata.category) ~= "string" then
    table.insert(errors, "category must be a string")
  end

  -- Optional but must be correct type if present
  if metadata.dependencies then
    if type(metadata.dependencies) ~= "table" then
      table.insert(errors, "dependencies must be an array")
    else
      for i, dep in ipairs(metadata.dependencies) do
        if type(dep) ~= "string" then
          table.insert(errors, "dependencies[" .. i .. "] must be a string")
        end
      end
    end
  end

  -- Validate devDependencies if present
  if metadata.devDependencies then
    if type(metadata.devDependencies) ~= "table" then
      table.insert(errors, "devDependencies must be an array")
    else
      for i, dep in ipairs(metadata.devDependencies) do
        if type(dep) ~= "string" then
          table.insert(errors, "devDependencies[" .. i .. "] must be a string")
        end
      end
    end
  end

  if metadata.exports then
    if type(metadata.exports) ~= "table" then
      table.insert(errors, "exports must be an object")
    else
      -- Validate exports.components
      if metadata.exports.components then
        if type(metadata.exports.components) ~= "table" then
          table.insert(errors, "exports.components must be an array")
        end
      end

      -- Validate exports.scripts
      if metadata.exports.scripts then
        if type(metadata.exports.scripts) ~= "table" then
          table.insert(errors, "exports.scripts must be an array")
        end
      end

      -- Validate exports.pages
      if metadata.exports.pages then
        if type(metadata.exports.pages) ~= "table" then
          table.insert(errors, "exports.pages must be an array")
        end
      end
    end
  end

  if metadata.minLevel then
    if type(metadata.minLevel) ~= "number" then
      table.insert(errors, "minLevel must be a number")
    elseif metadata.minLevel < 1 or metadata.minLevel > 6 then
      table.insert(errors, "minLevel must be between 1 and 6")
    end
  end

  if metadata.bindings then
    if type(metadata.bindings) ~= "table" then
      table.insert(errors, "bindings must be an object")
    else
      if metadata.bindings.dbal ~= nil and type(metadata.bindings.dbal) ~= "boolean" then
        table.insert(errors, "bindings.dbal must be a boolean")
      end
      if metadata.bindings.browser ~= nil and type(metadata.bindings.browser) ~= "boolean" then
        table.insert(errors, "bindings.browser must be a boolean")
      end
    end
  end

  return #errors == 0, errors
end

return validate_metadata
