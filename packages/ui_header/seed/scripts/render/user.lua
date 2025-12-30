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

---@class UserMenuComponent
---@field type string
---@field avatar? string
---@field name? string
---@field children? MenuItem[]

---@param user? User
---@return UserMenuComponent
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
