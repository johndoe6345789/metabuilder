-- Nav menu group component

---@class MenuGroup
---@field type string
---@field label string
---@field icon? string
---@field children table

---@param label string
---@param children? table
---@param icon? string
---@return MenuGroup
local function menu_group(label, children, icon)
  return {
    type = "menu_group",
    label = label,
    icon = icon,
    children = children or {}
  }
end

return menu_group
