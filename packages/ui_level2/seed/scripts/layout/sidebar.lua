-- Level 2 sidebar component

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class SidebarLayoutComponent
---@field type "sidebar"
---@field width string
---@field items UIComponent[]

---Renders the sidebar component with navigation items
---@param items UIComponent[]?
---@return SidebarLayoutComponent
local function sidebar(items)
  return {
    type = "sidebar",
    width = "250px",
    items = items or {}
  }
end

return sidebar
