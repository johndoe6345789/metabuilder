local check = require("check")
local LEVELS = require("levels")
local M = {}

function M.initiateTransfer(ctx)
  if not check.can_access(ctx.user, LEVELS.SUPERGOD) then
    return { success = false, error = "Supergod required" }
  end
  return { success = true, action = "open_transfer_dialog", tenantId = ctx.tenantId }
end

function M.confirmTransfer(ctx)
  if not check.can_access(ctx.user, LEVELS.SUPERGOD) then
    return { success = false, error = "Supergod required" }
  end
  if not ctx.targetUserId then
    return { success = false, error = "Target user required" }
  end
  return {
    success = true,
    action = "transfer_ownership",
    tenantId = ctx.tenantId,
    targetUserId = ctx.targetUserId
  }
end

function M.assignGod(ctx)
  if not check.can_access(ctx.user, LEVELS.SUPERGOD) then
    return { success = false, error = "Supergod required" }
  end
  return { success = true, action = "assign_god", userId = ctx.userId }
end

return M
