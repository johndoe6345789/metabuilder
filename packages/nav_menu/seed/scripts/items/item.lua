-- Nav menu item component

---@class MenuItemData
---@field type string
---@field label string
---@field path string
---@field icon? string

---@param label string
---@param path string
---@param icon? string
---@return MenuItemData
local function menu_item(label, path, icon)
  return {
    type = "menu_item",
    label = label,
    path = path,
    icon = icon
  }
end

return menu_item
