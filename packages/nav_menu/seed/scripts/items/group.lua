-- Nav menu group component
local function menu_group(label, children, icon)
  return {
    type = "menu_group",
    label = label,
    icon = icon,
    children = children or {}
  }
end

return menu_group
