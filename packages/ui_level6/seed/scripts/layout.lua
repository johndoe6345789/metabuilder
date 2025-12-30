-- Level 6 Supergod layout components

---@class SidebarComponent
---@field type string
---@field width string
---@field theme string
---@field items table[]

---@class ToolbarComponent
---@field type string
---@field actions table[]
---@field showAllTenants boolean
---@field showSystemMetrics boolean

---@class ContentComponent
---@field type string
---@field fullWidth boolean
---@field multiTenant boolean
---@field children table[]

local M = {}

---@param items? table[]
---@return SidebarComponent
function M.supergod_sidebar(items)
  return {
    type = "supergod_sidebar",
    width = "320px",
    theme = "system",
    items = items or {}
  }
end

---@param actions? table[]
---@return ToolbarComponent
function M.supergod_toolbar(actions)
  return {
    type = "supergod_toolbar",
    actions = actions or {},
    showAllTenants = true,
    showSystemMetrics = true
  }
end

---@param children? table[]
---@return ContentComponent
function M.supergod_content(children)
  return {
    type = "supergod_content",
    fullWidth = true,
    multiTenant = true,
    children = children or {}
  }
end

return M
