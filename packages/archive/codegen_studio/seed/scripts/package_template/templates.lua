-- Package template definitions
-- @module package_template.templates

local M = {}

---@return string[] Available package categories
function M.get_categories()
  return {
    "ui",
    "editors",
    "tools",
    "social",
    "media",
    "gaming",
    "admin",
    "config",
    "core",
    "demo",
    "development",
    "managers"
  }
end

---Generate metadata.json content
---@param config PackageConfig
---@return string JSON content
function M.generate_metadata(config)
  local metadata = {
    packageId = config.packageId,
    name = config.name,
    version = "1.0.0",
    description = config.description,
    icon = "static_content/icon.svg",
    author = config.author or "MetaBuilder",
    category = config.category,
    primary = config.primary,
    dependencies = config.dependencies or {},
    devDependencies = { "lua_test" },
    exports = {
      components = config.components or {},
      scripts = { "init" }
    },
    tests = {
      scripts = { "tests/metadata.test.lua", "tests/components.test.lua" },
      cases = { "tests/metadata.cases.json", "tests/components.cases.json" }
    },
    minLevel = config.minLevel
  }

  -- Add schema if requested
  if config.withSchema and config.entities and #config.entities > 0 then
    metadata.schema = {
      entities = config.entities,
      path = "schema/entities.yaml"
    }
  end

  -- Add permissions
  if config.permissions then
    metadata.permissions = {}
    for permKey, permConfig in pairs(config.permissions) do
      metadata.permissions[permKey] = {
        minLevel = permConfig.minLevel,
        description = permConfig.description
      }
    end
  else
    -- Generate default permissions based on package type
    metadata.permissions = M.generate_default_permissions(config)
  end

  return M.to_json(metadata)
end

---Generate default permissions based on package config
---@param config PackageConfig
---@return table<string, table>
function M.generate_default_permissions(config)
  local prefix = string.gsub(config.packageId, "_", ".")
  local permissions = {}

  -- Basic view permission
  permissions[prefix .. ".view"] = {
    minLevel = config.minLevel,
    description = "View " .. config.name
  }

  -- If primary, add more permissions
  if config.primary then
    permissions[prefix .. ".edit"] = {
      minLevel = config.minLevel,
      description = "Edit " .. config.name .. " content"
    }
  end

  -- If has schema, add CRUD permissions
  if config.withSchema and config.entities then
    for _, entity in ipairs(config.entities) do
      local entityLower = string.lower(entity)
      permissions[prefix .. "." .. entityLower .. ".create"] = {
        minLevel = config.minLevel,
        description = "Create " .. entity
      }
      permissions[prefix .. "." .. entityLower .. ".update"] = {
        minLevel = config.minLevel,
        description = "Update " .. entity
      }
      permissions[prefix .. "." .. entityLower .. ".delete"] = {
        minLevel = math.min(config.minLevel + 1, 6),
        description = "Delete " .. entity
      }
    end
  end

  return permissions
end

---Generate init.lua content
---@param config PackageConfig
---@return string Lua content
function M.generate_init_lua(config)
  local lines = {
    "--- " .. config.name .. " initialization",
    "--- @module init",
    "",
    "local M = {}",
    "",
    "---@class InstallContext",
    "---@field version string",
    "",
    "---@class InstallResult", 
    "---@field message string",
    "---@field version string",
    "",
    "---Called when package is installed",
    "---@param context InstallContext",
    "---@return InstallResult",
    "function M.on_install(context)",
    "  return {",
    "    message = \"" .. config.name .. " installed successfully\",",
    "    version = context.version",
    "  }",
    "end",
    "",
    "---Called when package is uninstalled",
    "---@return table",
    "function M.on_uninstall()",
    "  return { message = \"" .. config.name .. " removed\" }",
    "end",
    "",
    "return M"
  }
  return table.concat(lines, "\n")
end

---Generate component.json entry
---@param componentName string
---@param config PackageConfig
---@return table Component definition
function M.generate_component(componentName, config)
  local componentId = string.lower(config.packageId .. "_" .. componentName)
  
  return {
    id = componentId,
    type = "container",
    name = componentName,
    description = componentName .. " component for " .. config.name,
    props = {},
    layout = {
      type = "flex",
      props = {
        direction = "column",
        gap = 2
      }
    },
    bindings = {}
  }
end

---Generate components.json content
---@param config PackageConfig
---@return string JSON content
function M.generate_components_json(config)
  local components = {}
  
  if config.components then
    for _, name in ipairs(config.components) do
      table.insert(components, M.generate_component(name, config))
    end
  end
  
  return M.to_json(components)
end

---Generate test file content
---@param testName string Test name
---@param config PackageConfig
---@return string Lua test content
function M.generate_test(testName, config)
  local lines = {
    "-- " .. testName .. " tests for " .. config.packageId,
    "",
    "describe(\"" .. config.name .. " - " .. testName .. "\", function()",
    "  it(\"should pass basic validation\", function()",
    "    expect(true).toBe(true)",
    "  end)",
    "",
    "  it(\"should have required fields\", function()",
    "    -- TODO: Add specific tests",
    "    expect(true).toBe(true)",
    "  end)",
    "end)",
    ""
  }
  return table.concat(lines, "\n")
end

---Generate test cases JSON
---@param testName string
---@return string JSON content
function M.generate_test_cases(testName)
  local cases = {
    {
      name = "valid_input",
      input = {},
      expected = { valid = true }
    },
    {
      name = "invalid_input", 
      input = { invalid = true },
      expected = { valid = false }
    }
  }
  return M.to_json(cases)
end

---Generate schema YAML content
---@param config PackageConfig
---@return string YAML content
function M.generate_schema_yaml(config)
  if not config.entities or #config.entities == 0 then
    return "# No entities defined\n"
  end

  local lines = {
    "# " .. config.name .. " Entity Definitions",
    "# Auto-generated by package template generator",
    ""
  }

  for _, entity in ipairs(config.entities) do
    local prefixedEntity = "Pkg_" .. M.to_pascal_case(config.packageId) .. "_" .. entity
    table.insert(lines, prefixedEntity .. ":")
    table.insert(lines, "  description: \"" .. entity .. " entity for " .. config.name .. "\"")
    table.insert(lines, "  fields:")
    table.insert(lines, "    id:")
    table.insert(lines, "      type: string")
    table.insert(lines, "      primary: true")
    table.insert(lines, "    tenantId:")
    table.insert(lines, "      type: string")
    table.insert(lines, "      required: true")
    table.insert(lines, "      index: true")
    table.insert(lines, "    createdAt:")
    table.insert(lines, "      type: datetime")
    table.insert(lines, "      default: now")
    table.insert(lines, "    updatedAt:")
    table.insert(lines, "      type: datetime")
    table.insert(lines, "      onUpdate: now")
    table.insert(lines, "    # TODO: Add entity-specific fields")
    table.insert(lines, "")
  end

  return table.concat(lines, "\n")
end

---Generate layout.json content
---@param config PackageConfig
---@return string JSON content
function M.generate_layout_json(config)
  local layout = {
    id = config.packageId .. "_layout",
    name = config.name .. " Layout",
    type = "page",
    props = {
      title = config.name,
      minLevel = config.minLevel
    },
    children = {}
  }

  -- Add header section
  table.insert(layout.children, {
    id = config.packageId .. "_header",
    type = "container",
    props = { variant = "header" },
    children = {
      {
        id = config.packageId .. "_title",
        type = "text",
        props = { variant = "h1", content = config.name }
      },
      {
        id = config.packageId .. "_description",
        type = "text",
        props = { variant = "body1", content = config.description }
      }
    }
  })

  -- Add main content section
  table.insert(layout.children, {
    id = config.packageId .. "_content",
    type = "container",
    props = { variant = "main" },
    children = {
      {
        id = config.packageId .. "_placeholder",
        type = "text",
        props = { content = "Add your components here" }
      }
    }
  })

  return M.to_json(layout)
end

---Generate icon SVG
---@param config PackageConfig
---@return string SVG content
function M.generate_icon_svg(config)
  -- Get first letter of package name for icon
  local letter = string.upper(string.sub(config.name, 1, 1))
  
  return [[<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor" stroke="none">]] .. letter .. [[</text>
</svg>]]
end

---Generate README.md content
---@param config PackageConfig
---@return string Markdown content
function M.generate_readme(config)
  local lines = {
    "# " .. config.name,
    "",
    config.description,
    "",
    "## Installation",
    "",
    "This package is part of the MetaBuilder platform and is installed automatically.",
    "",
    "## Access Level",
    "",
    "Minimum level required: **" .. config.minLevel .. "**",
    "",
  }

  if config.primary then
    table.insert(lines, "This is a **primary package** that can own routes.")
  else
    table.insert(lines, "This is a **dependency package** that provides shared functionality.")
  end
  table.insert(lines, "")

  if config.withSchema and config.entities and #config.entities > 0 then
    table.insert(lines, "## Entities")
    table.insert(lines, "")
    for _, entity in ipairs(config.entities) do
      table.insert(lines, "- " .. entity)
    end
    table.insert(lines, "")
  end

  if config.components and #config.components > 0 then
    table.insert(lines, "## Components")
    table.insert(lines, "")
    for _, comp in ipairs(config.components) do
      table.insert(lines, "- `" .. comp .. "`")
    end
    table.insert(lines, "")
  end

  table.insert(lines, "## Development")
  table.insert(lines, "")
  table.insert(lines, "```bash")
  table.insert(lines, "# Run tests")
  table.insert(lines, "npm run test:package " .. config.packageId)
  table.insert(lines, "```")
  table.insert(lines, "")

  return table.concat(lines, "\n")
end

---Convert table to JSON string (simple implementation)
---@param tbl table
---@return string
function M.to_json(tbl)
  -- Use the global json if available, otherwise simple stringify
  if json and json.encode then
    return json.encode(tbl)
  end
  
  -- Simple fallback - in real usage would use proper JSON library
  return M.stringify(tbl, 0)
end

---Simple table to JSON string converter
---@param val any
---@param indent number
---@return string
function M.stringify(val, indent)
  local t = type(val)
  
  if t == "nil" then
    return "null"
  elseif t == "boolean" then
    return val and "true" or "false"
  elseif t == "number" then
    return tostring(val)
  elseif t == "string" then
    return '"' .. val:gsub('"', '\\"'):gsub('\n', '\\n') .. '"'
  elseif t == "table" then
    local spaces = string.rep("  ", indent)
    local nextSpaces = string.rep("  ", indent + 1)
    
    -- Check if array
    local isArray = #val > 0 or next(val) == nil
    if isArray then
      local items = {}
      for i, v in ipairs(val) do
        table.insert(items, nextSpaces .. M.stringify(v, indent + 1))
      end
      if #items == 0 then
        return "[]"
      end
      return "[\n" .. table.concat(items, ",\n") .. "\n" .. spaces .. "]"
    else
      local items = {}
      for k, v in pairs(val) do
        table.insert(items, nextSpaces .. '"' .. tostring(k) .. '": ' .. M.stringify(v, indent + 1))
      end
      if #items == 0 then
        return "{}"
      end
      return "{\n" .. table.concat(items, ",\n") .. "\n" .. spaces .. "}"
    end
  end
  
  return "null"
end

---Convert string to PascalCase
---@param str string
---@return string
function M.to_pascal_case(str)
  local result = ""
  for word in string.gmatch(str, "[^_]+") do
    result = result .. string.upper(string.sub(word, 1, 1)) .. string.sub(word, 2)
  end
  return result
end

return M
