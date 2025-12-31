---@class AdminToolbarComponent
---@field type string Component type identifier
---@field actions table[] Toolbar action buttons

---Creates an admin toolbar component with action buttons
---@param actions table[]? Action buttons to display in toolbar
---@return AdminToolbarComponent Admin toolbar component with actions
local function admin_toolbar(actions)
  return {
    type = "admin_toolbar",
    actions = actions or {}
  }
end

return admin_toolbar
