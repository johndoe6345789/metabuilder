-- Level 3 admin toolbar component
local function admin_toolbar(actions)
  return {
    type = "admin_toolbar",
    actions = actions or {}
  }
end

return admin_toolbar
