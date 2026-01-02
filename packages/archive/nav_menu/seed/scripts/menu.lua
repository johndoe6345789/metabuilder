local check = require("check")

---@class MenuModule
local M = {}

---@class UIComponent
---@field type string
---@field props? table<string, any>
---@field children? UIComponent[]

---@class MenuItem
---@field label string
---@field path? string
---@field minLevel? number
---@field children? MenuItem[]

---@class User
---@field level? number

---@class MenuProps
---@field items MenuItem[]
---@field user User

---@class FlexProps
---@field className string

---@class ButtonProps
---@field variant string
---@field text string
---@field onClick string
---@field data? string

---@class DropdownMenuTriggerProps
---@field text string

---@class DropdownMenuItemProps
---@field text string
---@field onClick string
---@field data? string

---@param props MenuProps
---@return UIComponent
function M.render(props)
  ---@type UIComponent[]
  local items = {}
  for _, item in ipairs(props.items or {}) do
    if M.can_show(props.user, item) then
      items[#items + 1] = M.item(item)
    end
  end
  return {
    type = "Flex",
    props = { className = "items-center gap-4" },
    children = items
  }
end

---@param user User
---@param item MenuItem
---@return boolean
function M.can_show(user, item)
  if not item.minLevel then return true end
  return check.can_access(user, item.minLevel)
end

---@param item MenuItem
---@return UIComponent
function M.item(item)
  if item.children then
    return {
      type = "DropdownMenu",
      children = {
        {
          type = "DropdownMenuTrigger",
          props = {
            ---@type DropdownMenuTriggerProps
            text = item.label
          }
        },
        { type = "DropdownMenuContent", children = M.sub_items(item.children) }
      }
    }
  end
  return {
    type = "Button",
    props = {
      ---@type ButtonProps
      variant = "ghost",
      text = item.label,
      onClick = "navigate",
      data = item.path
    }
  }
end

---@param children MenuItem[]
---@return UIComponent[]
function M.sub_items(children)
  ---@type UIComponent[]
  local items = {}
  for _, c in ipairs(children) do
    items[#items + 1] = {
      type = "DropdownMenuItem",
      props = {
        ---@type DropdownMenuItemProps
        text = c.label,
        onClick = "navigate",
        data = c.path
      }
    }
  end
  return items
end

return M
