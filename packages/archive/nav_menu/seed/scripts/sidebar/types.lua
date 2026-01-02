-- Type definitions for sidebar

---@class UIComponent
---@field type string
---@field props? table
---@field children? table

---@class SidebarItem
---@field label string
---@field path string

---@class SidebarProps
---@field items SidebarItem[]
---@field currentPath? string
---@field title? string

return {}
