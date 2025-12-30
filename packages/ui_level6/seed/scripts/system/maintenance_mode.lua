-- Maintenance mode toggle component
-- Single function module for supergod administration

---@class MaintenanceMode
local M = {}

---Render maintenance mode toggle
---@param enabled boolean Current maintenance mode status
---@return MaintenanceToggleComponent
function M.maintenance_mode(enabled)
  return {
    type = "maintenance_toggle",
    enabled = enabled,
    warningMessage = "Enabling maintenance mode will prevent all non-supergod users from accessing the system."
  }
end

return M
