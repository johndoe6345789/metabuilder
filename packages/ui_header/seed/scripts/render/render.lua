-- Main render function for header

local logo_section = require("render.logo_section")
local user_section = require("render.user_section")

---@class HeaderProps
---@field variant? "default"|"admin"
---@field title? string
---@field showHome? boolean
---@field username? string
---@field showBadge? boolean
---@field showAvatar? boolean
---@field showLogout? boolean

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---Renders the complete header component
---@param props HeaderProps
---@return UIComponent
local function render(props)
  local variant = props.variant or "default"
  local bg = variant == "admin" and "bg-sidebar" or "bg-card"
  
  return {
    type = "Box",
    props = { className = "border-b sticky top-0 z-50 " .. bg },
    children = {
      {
        type = "Container",
        props = { className = "flex justify-between items-center h-16 px-4" },
        children = {
          logo_section(props),
          user_section(props)
        }
      }
    }
  }
end

return render
