-- Package generator - creates all files for a new package
-- @module package_template.generator

local templates = require("package_template.templates")

local M = {}

---Get default package configuration
---@param packageId string
---@return PackageConfig
function M.get_default_config(packageId)
  -- Convert package_id to display name
  local name = packageId:gsub("_", " "):gsub("(%l)(%w*)", function(a, b) 
    return string.upper(a) .. b 
  end)

  return {
    packageId = packageId,
    name = name,
    description = name .. " package for MetaBuilder",
    author = "MetaBuilder",
    category = "ui",
    minLevel = 2,
    primary = true,
    withSchema = false,
    withTests = true,
    withComponents = false,
    entities = {},
    components = {},
    dependencies = {}
  }
end

---Validate package configuration
---@param config PackageConfig
---@return boolean valid
---@return string[] errors
function M.validate_config(config)
  local errors = {}

  -- Required fields
  if not config.packageId then
    table.insert(errors, "packageId is required")
  elseif not string.match(config.packageId, "^[a-z][a-z0-9_]*$") then
    table.insert(errors, "packageId must be lowercase with underscores, starting with a letter")
  end

  if not config.name then
    table.insert(errors, "name is required")
  end

  if not config.description then
    table.insert(errors, "description is required")
  end

  if not config.category then
    table.insert(errors, "category is required")
  else
    local validCategories = templates.get_categories()
    local found = false
    for _, cat in ipairs(validCategories) do
      if cat == config.category then
        found = true
        break
      end
    end
    if not found then
      table.insert(errors, "category must be one of: " .. table.concat(validCategories, ", "))
    end
  end

  if config.minLevel == nil then
    table.insert(errors, "minLevel is required")
  elseif type(config.minLevel) ~= "number" or config.minLevel < 0 or config.minLevel > 6 then
    table.insert(errors, "minLevel must be a number between 0 and 6")
  end

  if config.primary == nil then
    table.insert(errors, "primary is required (true or false)")
  end

  -- Validate entities if schema is requested
  if config.withSchema then
    if not config.entities or #config.entities == 0 then
      table.insert(errors, "entities are required when withSchema is true")
    else
      for i, entity in ipairs(config.entities) do
        if not string.match(entity, "^[A-Z][a-zA-Z0-9]*$") then
          table.insert(errors, "entity[" .. i .. "] must be PascalCase (e.g., 'ForumPost')")
        end
      end
    end
  end

  -- Validate component names
  if config.components then
    for i, comp in ipairs(config.components) do
      if not string.match(comp, "^[A-Z][a-zA-Z0-9]*$") then
        table.insert(errors, "component[" .. i .. "] must be PascalCase (e.g., 'MyComponent')")
      end
    end
  end

  return #errors == 0, errors
end

---Generate all files for a new package
---@param config PackageConfig
---@return GenerateResult
function M.generate(config)
  local valid, errors = M.validate_config(config)
  if not valid then
    return {
      success = false,
      files = {},
      errors = errors,
      packagePath = ""
    }
  end

  local files = {}
  local packagePath = "packages/" .. config.packageId

  -- Generate seed/metadata.json
  table.insert(files, {
    path = "seed/metadata.json",
    content = templates.generate_metadata(config)
  })

  -- Generate seed/components.json
  table.insert(files, {
    path = "seed/components.json",
    content = templates.generate_components_json(config)
  })

  -- Generate seed/layout.json
  table.insert(files, {
    path = "seed/layout.json",
    content = templates.generate_layout_json(config)
  })

  -- Generate seed/scripts/init.lua
  table.insert(files, {
    path = "seed/scripts/init.lua",
    content = templates.generate_init_lua(config)
  })

  -- Generate schema if requested
  if config.withSchema and config.entities and #config.entities > 0 then
    table.insert(files, {
      path = "seed/schema/entities.yaml",
      content = templates.generate_schema_yaml(config)
    })

    -- Generate db operations stub
    table.insert(files, {
      path = "seed/scripts/db/operations.lua",
      content = M.generate_db_operations(config)
    })
  end

  -- Generate tests if requested
  if config.withTests then
    table.insert(files, {
      path = "seed/scripts/tests/metadata.test.lua",
      content = templates.generate_test("metadata", config)
    })

    table.insert(files, {
      path = "seed/scripts/tests/components.test.lua",
      content = templates.generate_test("components", config)
    })

    table.insert(files, {
      path = "seed/scripts/tests/metadata.cases.json",
      content = templates.generate_test_cases("metadata")
    })

    table.insert(files, {
      path = "seed/scripts/tests/components.cases.json",
      content = templates.generate_test_cases("components")
    })
  end

  -- Generate static content
  table.insert(files, {
    path = "static_content/icon.svg",
    content = templates.generate_icon_svg(config)
  })

  -- Generate README
  table.insert(files, {
    path = "README.md",
    content = templates.generate_readme(config)
  })

  -- Generate index.ts for TypeScript exports
  table.insert(files, {
    path = "seed/index.ts",
    content = M.generate_index_ts(config)
  })

  return {
    success = true,
    files = files,
    errors = {},
    packagePath = packagePath
  }
end

---Generate db operations Lua file
---@param config PackageConfig
---@return string
function M.generate_db_operations(config)
  local lines = {
    "-- Database operations for " .. config.name,
    "-- Auto-generated by package template generator",
    "",
    "local M = {}",
    ""
  }

  if config.entities then
    for _, entity in ipairs(config.entities) do
      local entityLower = string.lower(entity)
      
      table.insert(lines, "-- " .. entity .. " operations")
      table.insert(lines, "")
      
      -- List
      table.insert(lines, "---List all " .. entity .. " records")
      table.insert(lines, "---@param ctx DBALContext")
      table.insert(lines, "---@return table[]")
      table.insert(lines, "function M.list_" .. entityLower .. "(ctx)")
      table.insert(lines, "  -- TODO: Implement list operation")
      table.insert(lines, "  return {}")
      table.insert(lines, "end")
      table.insert(lines, "")
      
      -- Get
      table.insert(lines, "---Get a single " .. entity .. " by ID")
      table.insert(lines, "---@param ctx DBALContext")
      table.insert(lines, "---@param id string")
      table.insert(lines, "---@return table|nil")
      table.insert(lines, "function M.get_" .. entityLower .. "(ctx, id)")
      table.insert(lines, "  -- TODO: Implement get operation")
      table.insert(lines, "  return nil")
      table.insert(lines, "end")
      table.insert(lines, "")
      
      -- Create
      table.insert(lines, "---Create a new " .. entity)
      table.insert(lines, "---@param ctx DBALContext")
      table.insert(lines, "---@param data table")
      table.insert(lines, "---@return table")
      table.insert(lines, "function M.create_" .. entityLower .. "(ctx, data)")
      table.insert(lines, "  -- TODO: Implement create operation")
      table.insert(lines, "  return data")
      table.insert(lines, "end")
      table.insert(lines, "")
      
      -- Update
      table.insert(lines, "---Update an existing " .. entity)
      table.insert(lines, "---@param ctx DBALContext")
      table.insert(lines, "---@param id string")
      table.insert(lines, "---@param data table")
      table.insert(lines, "---@return table|nil")
      table.insert(lines, "function M.update_" .. entityLower .. "(ctx, id, data)")
      table.insert(lines, "  -- TODO: Implement update operation")
      table.insert(lines, "  return nil")
      table.insert(lines, "end")
      table.insert(lines, "")
      
      -- Delete
      table.insert(lines, "---Delete a " .. entity)
      table.insert(lines, "---@param ctx DBALContext")
      table.insert(lines, "---@param id string")
      table.insert(lines, "---@return boolean")
      table.insert(lines, "function M.delete_" .. entityLower .. "(ctx, id)")
      table.insert(lines, "  -- TODO: Implement delete operation")
      table.insert(lines, "  return false")
      table.insert(lines, "end")
      table.insert(lines, "")
    end
  end

  table.insert(lines, "return M")
  
  return table.concat(lines, "\n")
end

---Generate TypeScript index file
---@param config PackageConfig
---@return string
function M.generate_index_ts(config)
  local lines = {
    "// " .. config.name .. " package exports",
    "// Auto-generated by package template generator",
    "",
    "import metadata from './metadata.json'",
    "import components from './components.json'",
    "import layout from './layout.json'",
    "",
    "export const packageSeed = {",
    "  metadata,",
    "  components,",
    "  layout,",
    "}",
    "",
    "export default packageSeed",
    ""
  }
  
  return table.concat(lines, "\n")
end

---Generate package to file system (would need file I/O)
---@param config PackageConfig
---@param basePath string Base path for packages directory
---@return GenerateResult
function M.generate_to_disk(config, basePath)
  local result = M.generate(config)
  
  if not result.success then
    return result
  end
  
  -- In actual implementation, this would write files to disk
  -- For now, return the generated structure
  result.packagePath = basePath .. "/" .. config.packageId
  
  return result
end

return M
