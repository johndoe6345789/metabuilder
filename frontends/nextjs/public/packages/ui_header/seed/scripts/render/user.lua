-- Header user section

---@class User
---@field avatar? string
---@field name string
---@field role? string

---@class MenuItem
---@field label? string
---@field path? string
---@field action? string
---@field type? string

---@class AuthButtonsComponent
---@field type "auth_buttons"
---@field children MenuItem[]

---@class UserMenuComponent
---@field type "user_menu"
---@field avatar? string
---@field name? string
---@field items MenuItem[]

---@alias HeaderUserComponent AuthButtonsComponent|UserMenuComponent

---@param user? User
---@return HeaderUserComponent
local function user_section(user)
  if not user then
    return {
      type = "auth_buttons",
      children = {
        { type = "button", label = "Login", action = "navigate", path = "/login" },
        { type = "button", label = "Sign Up", action = "navigate", path = "/register" }
      }
    }
  end
  
  return {
    type = "user_menu",
    avatar = user.avatar,
    name = user.name,
    items = {
      { label = "Profile", path = "/profile" },
      { label = "Settings", path = "/settings" },
      { type = "divider" },
      { label = "Logout", action = "logout" }
    }
  }
end

return user_section
