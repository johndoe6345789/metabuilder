-- User create dialog
-- Single function module for admin user dialogs

---@class RenderCreate
local M = {}

---Render create user dialog
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

return M
