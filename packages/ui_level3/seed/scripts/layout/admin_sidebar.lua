-- Level 3 admin sidebar component
local function admin_sidebar(items)
  return {
    type = "admin_sidebar",
    width = "280px",
    collapsible = true,
    items = items or {}
  }
end

return admin_sidebar
