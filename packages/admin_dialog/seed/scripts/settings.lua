-- Admin settings dialog
local M = {}

function M.render_general()
  return {
    type = "dialog",
    props = {
      title = "General Settings",
      size = "large"
    },
    children = {
      { type = "text_field", props = { label = "Site Name", name = "site_name" } },
      { type = "text_field", props = { label = "Admin Email", name = "admin_email", type = "email" } },
      { type = "switch", props = { label = "Maintenance Mode", name = "maintenance" } },
      { type = "switch", props = { label = "Allow Registration", name = "allow_registration" } }
    }
  }
end

function M.render_security()
  return {
    type = "dialog",
    props = {
      title = "Security Settings",
      size = "medium"
    },
    children = {
      { type = "number_field", props = { label = "Session Timeout (min)", name = "session_timeout", min = 5 } },
      { type = "number_field", props = { label = "Max Login Attempts", name = "max_attempts", min = 1 } },
      { type = "switch", props = { label = "Require 2FA", name = "require_2fa" } }
    }
  }
end

return M
