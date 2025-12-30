-- Level 6 Supergod layout components
local M = {}

function M.supergod_sidebar(items)
  return {
    type = "supergod_sidebar",
    width = "320px",
    theme = "system",
    items = items or {}
  }
end

function M.supergod_toolbar(actions)
  return {
    type = "supergod_toolbar",
    actions = actions or {},
    showAllTenants = true,
    showSystemMetrics = true
  }
end

function M.supergod_content(children)
  return {
    type = "supergod_content",
    fullWidth = true,
    multiTenant = true,
    children = children or {}
  }
end

return M
