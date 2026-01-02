--- Role Editor Package
--- Provides configurable role management UI components
---@module init

---@class RoleEditorModule
---@field role table Role management functions
---@field config table Configuration utilities
return {
  role = require("role"),
  config = require("config")
}
