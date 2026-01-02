-- Create tenant action handler
-- Single function module for tenant management

---@class CreateTenant
local M = {}

---Handle create tenant action
---@return ActionResult
function M.createTenant()
  return { success = true, action = "open_create_dialog" }
end

return M
