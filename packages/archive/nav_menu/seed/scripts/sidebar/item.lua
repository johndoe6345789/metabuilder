-- Render sidebar item
require("sidebar.types")

local M = {}

---@param item SidebarItem
---@param currentPath? string
---@return UIComponent
function M.item(item, currentPath)
  local active = currentPath == item.path
  return {
    type = "Button",
    props = {
      variant = active and "secondary" or "ghost",
      className = "w-full justify-start",
      text = item.label,
      onClick = "navigate",
      data = item.path
    }
  }
end

return M
