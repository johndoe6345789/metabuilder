-- User section component for header

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

---Renders the user info and actions section of the header
---@param props HeaderProps
---@return UIComponent
local function user_section(props)
  local children = {}
  if props.username and props.showBadge then
    children[#children + 1] = { type = "Badge", props = { text = props.username } }
  end
  if props.username and props.showAvatar then
    children[#children + 1] = { type = "Avatar", props = { fallback = string.sub(props.username, 1, 1) } }
  end
  if props.showLogout then
    children[#children + 1] = { type = "Button", props = { variant = "ghost", text = "Logout", onClick = "handleLogout" } }
  end
  return { type = "Flex", props = { className = "items-center gap-2" }, children = children }
end

return user_section
