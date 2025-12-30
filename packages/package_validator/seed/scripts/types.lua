---@meta
-- Type definitions for package_validator

---@class ValidationOptions
---@field skipStructure? boolean Skip folder structure validation
---@field skipLua? boolean Skip Lua file validation

---@class ValidationResult
---@field valid boolean Whether validation passed
---@field errors string[] List of error messages
---@field warnings string[] List of warning messages

---@class Metadata
---@field packageId string Unique package identifier
---@field name string Display name
---@field version string Semantic version (e.g., "1.0.0")
---@field description string Package description
---@field author string Author name
---@field category string Category name
---@field dependencies? string[] Package dependencies
---@field devDependencies? string[] Development dependencies
---@field exports? MetadataExports Exported items
---@field minLevel? number Minimum permission level (1-6)
---@field bindings? MetadataBindings Available bindings
---@field icon? string Path to icon file

---@class MetadataExports
---@field components? string[] Exported component names
---@field scripts? string[] Exported script names
---@field pages? string[] Exported page names

---@class MetadataBindings
---@field dbal? boolean DBAL access
---@field browser? boolean Browser API access

---@class Component
---@field id string Unique component identifier
---@field type string Component type
---@field name? string Display name
---@field description? string Component description
---@field props? table Component properties
---@field layout? ComponentLayout Layout configuration
---@field scripts? table Script bindings
---@field bindings? MetadataBindings Component bindings

---@class ComponentLayout
---@field type string Layout type
---@field props? table Layout properties
---@field children? ComponentLayout[] Child layouts

---@class StructureConfig
---@field [string] string|boolean File/directory requirements

---@class CLIOptions
---@field package_name? string Name of package to validate
---@field skipStructure boolean Skip structure validation
---@field skipLua boolean Skip Lua validation
---@field verbose boolean Show detailed output
---@field json_output boolean Output as JSON

return {}
