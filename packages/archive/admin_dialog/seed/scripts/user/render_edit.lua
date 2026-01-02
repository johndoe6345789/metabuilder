-- User edit dialog
-- Single function module for admin user dialogs

---@class RenderEdit
local M = {}

---Render edit user dialog
---@param user User User data to edit
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
