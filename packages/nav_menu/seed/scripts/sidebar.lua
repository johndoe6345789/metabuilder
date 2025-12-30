---@class SidebarModule
local M = {}

---@class UIComponent
---@field type string
---@field props? table
---@field children? table

---@class SidebarItem
---@field label string
---@field path string

---@class SidebarProps
---@field items SidebarItem[]
---@field currentPath? string
---@field title? string

---@param props SidebarProps
---@return UIComponent
function M.render(props)
  local items = {}
  for _, item in ipairs(props.items or {}) do
    items[#items + 1] = M.item(item, props.currentPath)
  end
  return {
    type = "Box",
    props = { className = "w-64 border-r h-screen bg-sidebar" },
    children = {
      M.header(props),
      { type = "Stack", props = { spacing = 1, className = "p-4" }, children = items }
    }
  }
end

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
