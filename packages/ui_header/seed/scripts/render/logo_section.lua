-- Logo section component for header

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

---Renders the logo and navigation section of the header
---@param props HeaderProps
---@return UIComponent
local function logo_section(props)
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

return logo_section
