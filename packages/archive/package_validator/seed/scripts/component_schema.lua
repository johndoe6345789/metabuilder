--- Component JSON schema validation facade
--- Re-exports component validation functions for backward compatibility
---@module component_schema

local validate_component = require("validate_component")
local validate_layout = require("validate_layout")
local validate_components = require("validate_components")

---@class ComponentSchema
local M = {}

--- Validate a single component structure
---@param component Component The component to validate
---@param index? number Optional component index for error messages
---@return string[] errors List of validation errors
M.validate_component = validate_component

--- Validate layout structure recursively
---@param layout ComponentLayout The layout to validate
---@param path string The current path for error messages
---@return string[] errors List of validation errors
M.validate_layout = validate_layout

--- Validate components.json (array of components)
---@param components Component[] Array of component definitions
---@return boolean valid Whether all components are valid
---@return string[] errors List of validation errors
M.validate_components = validate_components

return M
