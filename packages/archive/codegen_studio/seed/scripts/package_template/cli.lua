-- Package template CLI interface
-- @module package_template.cli

local generator = require("package_template.generator")
local templates = require("package_template.templates")

local M = {}

---Print usage help
function M.print_help()
  print([[
Package Template Generator
==========================

Usage: lua cli.lua <command> [options]

Commands:
  new <package_id>    Create a new package with interactive prompts
  quick <package_id>  Create a new package with defaults
  list-categories     List available package categories
  validate <config>   Validate a package configuration

Options for 'new' and 'quick':
  --name <name>           Display name (default: derived from package_id)
  --description <desc>    Package description
  --category <cat>        Package category (default: ui)
  --min-level <n>         Minimum access level 0-6 (default: 2)
  --primary               Package can own routes (default)
  --dependency            Package is dependency-only
  --with-schema           Include database schema scaffolding
  --entities <e1,e2>      Entity names for schema (comma-separated)
  --with-components       Include component scaffolding
  --components <c1,c2>    Component names (comma-separated)
  --deps <d1,d2>          Package dependencies (comma-separated)
  --output <path>         Output directory (default: packages/)

Examples:
  lua cli.lua new my_package --category tools --min-level 3
  lua cli.lua quick my_widget --dependency --category ui
  lua cli.lua new forum_clone --with-schema --entities Thread,Post,Reply
  lua cli.lua new my_dashboard --with-components --components StatCard,Chart
]])
end

---Parse command line arguments
---@param args string[]
---@return table
function M.parse_args(args)
  local parsed = {
    command = nil,
    packageId = nil,
    options = {
      name = nil,
      description = nil,
      category = "ui",
      minLevel = 2,
      primary = true,
      withSchema = false,
      withTests = true,
      withComponents = false,
      entities = {},
      components = {},
      dependencies = {},
      output = "packages/"
    }
  }

  local i = 1
  while i <= #args do
    local arg = args[i]

    if not parsed.command then
      parsed.command = arg
    elseif not parsed.packageId and not string.match(arg, "^%-") then
      parsed.packageId = arg
    elseif arg == "--name" then
      i = i + 1
      parsed.options.name = args[i]
    elseif arg == "--description" then
      i = i + 1
      parsed.options.description = args[i]
    elseif arg == "--category" then
      i = i + 1
      parsed.options.category = args[i]
    elseif arg == "--min-level" then
      i = i + 1
      parsed.options.minLevel = tonumber(args[i])
    elseif arg == "--primary" then
      parsed.options.primary = true
    elseif arg == "--dependency" then
      parsed.options.primary = false
    elseif arg == "--with-schema" then
      parsed.options.withSchema = true
    elseif arg == "--entities" then
      i = i + 1
      for entity in string.gmatch(args[i], "[^,]+") do
        table.insert(parsed.options.entities, entity)
      end
    elseif arg == "--with-components" then
      parsed.options.withComponents = true
    elseif arg == "--components" then
      i = i + 1
      for comp in string.gmatch(args[i], "[^,]+") do
        table.insert(parsed.options.components, comp)
      end
    elseif arg == "--deps" then
      i = i + 1
      for dep in string.gmatch(args[i], "[^,]+") do
        table.insert(parsed.options.dependencies, dep)
      end
    elseif arg == "--output" then
      i = i + 1
      parsed.options.output = args[i]
    elseif arg == "--help" or arg == "-h" then
      parsed.command = "help"
    end

    i = i + 1
  end

  return parsed
end

---Build config from parsed arguments
---@param parsed table
---@return PackageConfig
function M.build_config(parsed)
  local defaults = generator.get_default_config(parsed.packageId)
  
  return {
    packageId = parsed.packageId,
    name = parsed.options.name or defaults.name,
    description = parsed.options.description or defaults.description,
    author = "MetaBuilder",
    category = parsed.options.category,
    minLevel = parsed.options.minLevel,
    primary = parsed.options.primary,
    withSchema = parsed.options.withSchema,
    withTests = parsed.options.withTests,
    withComponents = parsed.options.withComponents,
    entities = parsed.options.entities,
    components = parsed.options.components,
    dependencies = parsed.options.dependencies
  }
end

---Execute the CLI
---@param args string[]
---@return number Exit code
function M.run(args)
  local parsed = M.parse_args(args)

  if parsed.command == "help" or not parsed.command then
    M.print_help()
    return 0
  end

  if parsed.command == "list-categories" then
    print("Available categories:")
    for _, cat in ipairs(templates.get_categories()) do
      print("  - " .. cat)
    end
    return 0
  end

  if parsed.command == "new" or parsed.command == "quick" then
    if not parsed.packageId then
      print("Error: package_id is required")
      return 1
    end

    local config = M.build_config(parsed)
    local valid, errors = generator.validate_config(config)
    
    if not valid then
      print("Configuration errors:")
      for _, err in ipairs(errors) do
        print("  - " .. err)
      end
      return 1
    end

    local result = generator.generate(config)
    
    if not result.success then
      print("Generation failed:")
      for _, err in ipairs(result.errors) do
        print("  - " .. err)
      end
      return 1
    end

    print("Generated package: " .. result.packagePath)
    print("Files:")
    for _, file in ipairs(result.files) do
      print("  - " .. file.path)
    end
    
    return 0
  end

  print("Unknown command: " .. (parsed.command or "none"))
  M.print_help()
  return 1
end

return M
