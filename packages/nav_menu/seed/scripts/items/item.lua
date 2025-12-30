-- Nav menu item component
local function menu_item(label, path, icon)
  return {
    type = "menu_item",
    label = label,
    path = path,
    icon = icon
  }
end

return menu_item
