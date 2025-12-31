-- Schema Editor initialization

---@class SchemaEditorModule
---@field name string Package name
---@field version string Package version
---@field init fun(): SchemaEditorInfo Initialize the module
local M = {}

M.name = "schema_editor"
M.version = "1.0.0"

---@class SchemaEditorInfo
---@field name string Package name
---@field version string Package version
---@field loaded boolean Whether module is loaded

---Initialize the schema editor module
---@return SchemaEditorInfo
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
