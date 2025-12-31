-- Delete tenant action handler
-- Single function module for tenant management

---@class DeleteTenant
local M = {}

---Handle delete tenant action
---@param ctx TenantContext Context with tenantId
---@return ActionResult
function M.deleteTenant(ctx)
  return { success = true, action = "confirm_delete", id = ctx.tenantId }
end

return M
