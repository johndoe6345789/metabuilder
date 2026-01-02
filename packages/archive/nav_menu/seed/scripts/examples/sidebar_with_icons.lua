-- Example: Sidebar navigation with icons
local icons = require("icons")
local sidebar = require("sidebar")

---@class SidebarExample
local M = {}

---Create example sidebar with icons
---@return UIComponent
function M.create_example_sidebar()
  local items = {
    {
      label = "Dashboard",
      path = "/dashboard",
      icon = icons.get("DASHBOARD")
    },
    {
      label = "Analytics",
      path = "/analytics",
      icon = icons.get("ANALYTICS")
    },
    {
      label = "Users",
      path = "/users",
      icon = icons.get("USERS")
    },
    {
      label = "Database",
      path = "/database",
      icon = icons.get("DATABASE")
    },
    {
      label = "Settings",
      path = "/settings",
      icon = icons.get("SETTINGS")
    },
    {
      label = "Profile",
      path = "/profile",
      icon = icons.get("PROFILE")
    }
  }

  return sidebar.render({
    items = items,
    currentPath = "/dashboard",
    title = "Navigation"
  })
end

---Create admin sidebar with icons
---@return UIComponent
function M.create_admin_sidebar()
  local items = {
    {
      label = "Admin Panel",
      path = "/admin",
      icon = icons.get("ADMIN_PANEL")
    },
    {
      label = "User Management",
      path = "/admin/users",
      icon = icons.get("MANAGE_ACCOUNTS")
    },
    {
      label = "Security",
      path = "/admin/security",
      icon = icons.get("SECURITY")
    },
    {
      label = "Policies",
      path = "/admin/policies",
      icon = icons.get("POLICY")
    },
    {
      label = "Workflows",
      path = "/admin/workflows",
      icon = icons.get("WORKFLOW")
    },
    {
      label = "Schema",
      path = "/admin/schema",
      icon = icons.get("SCHEMA")
    }
  }

  return sidebar.render({
    items = items,
    currentPath = "/admin",
    title = "Admin"
  })
end

return M
