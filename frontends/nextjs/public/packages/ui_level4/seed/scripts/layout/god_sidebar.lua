-- Level 4 God panel sidebar component
-- Represents the sidebar area of the God panel layout with dark theme

---@class SidebarItem
---@field id string
---@field label string
---@field icon? string
---@field onClick? string

---@class UIComponent
---@field type string
---@field width string
---@field theme string
---@field items SidebarItem[]

---@param items? SidebarItem[]
---@return UIComponent
local function god_sidebar(items)
  return {
    type = "god_sidebar",
    width = "300px",
    theme = "dark",
    items = items or {}
  }
end

return god_sidebar
