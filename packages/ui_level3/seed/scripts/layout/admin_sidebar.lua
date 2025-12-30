---@class AdminSidebarComponent
---@field type string Component type identifier
---@field width string Sidebar width in CSS units
---@field collapsible boolean Whether sidebar can be collapsed
---@field items table[] Sidebar menu items

---Creates an admin sidebar navigation component
---@param items table[]? Sidebar menu items to display
---@return AdminSidebarComponent Admin sidebar component with menu items
local function admin_sidebar(items)
  return {
    type = "admin_sidebar",
    width = "280px",
    collapsible = true,
    items = items or {}
  }
end

return admin_sidebar
