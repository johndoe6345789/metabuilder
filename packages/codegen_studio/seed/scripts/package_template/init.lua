-- Package Template Generator
-- Generates new MetaBuilder packages with proper structure
-- @module package_template

local M = {}

local templates = require("package_template.templates")
local generator = require("package_template.generator")

---@class PackageConfig
---@field packageId string Package identifier (lowercase with underscores)
---@field name string Display name
---@field description string Package description
---@field author? string Author name (default: "MetaBuilder")
---@field category string Package category
---@field minLevel number Minimum access level (0-6)
---@field primary boolean Whether package can own routes
---@field withSchema boolean Include database schema
---@field withTests boolean Include test scaffolding
---@field withComponents boolean Include component scaffolding
---@field entities? string[] Entity names for schema (if withSchema)
---@field components? string[] Component names to scaffold
---@field dependencies? string[] Package dependencies
---@field permissions? table<string, PermissionConfig> Permission declarations

---@class PermissionConfig
---@field minLevel number Minimum level required
---@field description string Permission description

---@class GenerateResult
---@field success boolean Whether generation succeeded
---@field files GeneratedFile[] List of generated files
---@field errors string[] Any errors encountered
---@field packagePath string Root path of generated package

---@class GeneratedFile
---@field path string Relative path within package
---@field content string File content

-- Re-export main functions
M.generate = generator.generate
M.generate_metadata = templates.generate_metadata
M.generate_component = templates.generate_component
M.generate_test = templates.generate_test
M.validate_config = generator.validate_config
M.get_template_categories = templates.get_categories
M.get_default_config = generator.get_default_config

return M
