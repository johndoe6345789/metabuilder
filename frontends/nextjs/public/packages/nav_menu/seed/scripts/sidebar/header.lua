-- Render sidebar header
require("sidebar.types")

local M = {}

---@param props SidebarProps
---@return UIComponent
function M.header(props)
  return {
    type = "Box",
    props = { className = "p-4 border-b" },
    children = {
      { type = "Typography", props = { variant = "h6", text = props.title or "Menu" } }
    }
  }
end

return M
