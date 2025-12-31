-- Render sidebar component
require("sidebar.types")
local header_module = require("sidebar.header")
local item_module = require("sidebar.item")

local M = {}

---@param props SidebarProps
---@return UIComponent
function M.render(props)
  local items = {}
  for _, item in ipairs(props.items or {}) do
    items[#items + 1] = item_module.item(item, props.currentPath)
  end
  return {
    type = "Box",
    props = { className = "w-64 border-r h-screen bg-sidebar" },
    children = {
      header_module.header(props),
      { type = "Stack", props = { spacing = 1, className = "p-4" }, children = items }
    }
  }
end

return M
