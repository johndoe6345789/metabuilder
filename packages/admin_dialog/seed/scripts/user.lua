-- User management dialog

---@class UserDialog
local M = {}

---@class User
---@field username string
---@field email string
---@field role string
---@field active boolean

---@class UIComponent
---@field type string
---@field props? table
---@field children? table

---@return UIComponent
function M.render_create()
  return {
    type = "dialog",
    props = {
      title = "Create User",
      size = "medium"
    },
    children = {
      { type = "text_field", props = { label = "Username", name = "username", required = true } },
      { type = "text_field", props = { label = "Email", name = "email", type = "email", required = true } },
      { type = "password_field", props = { label = "Password", name = "password", required = true } },
      { type = "select", props = { label = "Role", name = "role", options = {"user", "admin"} } }
    }
  }
end

---@param user User
---@return UIComponent
function M.render_edit(user)
  return {
    type = "dialog",
    props = {
      title = "Edit User",
      size = "medium"
    },
    children = {
      { type = "text_field", props = { label = "Username", name = "username", value = user.username } },
      { type = "text_field", props = { label = "Email", name = "email", value = user.email } },
      { type = "select", props = { label = "Role", name = "role", value = user.role, options = {"user", "admin"} } },
      { type = "checkbox", props = { label = "Active", name = "active", checked = user.active } }
    }
  }
end

return M
