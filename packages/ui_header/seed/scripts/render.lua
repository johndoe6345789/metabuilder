-- Header render component

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

local M = {}

---@param props HeaderProps
---@return UIComponent
function M.render(props)
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
          M.logo_section(props),
          M.user_section(props)
        }
      }
    }
  }
end

---@param props HeaderProps
---@return UIComponent
function M.logo_section(props)
  return {
    type = "Flex",
    props = { className = "items-center gap-6" },
    children = {
      { type = "Box", props = { className = "w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" } },
      { type = "Typography", props = { variant = "h6", text = props.title or "MetaBuilder" } },
      props.showHome and {
        type = "Button",
        props = { variant = "ghost", text = "Home", onClick = "navigateHome" }
      } or nil
    }
  }
end

---@param props HeaderProps
---@return UIComponent
function M.user_section(props)
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

return M
