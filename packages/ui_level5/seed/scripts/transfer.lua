-- Transfer utilities for Level 5

local check = require("check")
local LEVELS = require("levels")

---@class User
---@field id string

---@class TransferContext
---@field user User
---@field tenantId? string
---@field targetUserId? string
---@field userId? string

---@class TransferResult
---@field success boolean
---@field error? string
---@field action? string
---@field tenantId? string
---@field targetUserId? string
---@field userId? string

local M = {}

---@param ctx TransferContext
---@return TransferResult
function M.initiateTransfer(ctx)
  if not check.can_access(ctx.user, LEVELS.SUPERGOD) then
    return { success = false, error = "Supergod required" }
  end
  return { success = true, action = "open_transfer_dialog", tenantId = ctx.tenantId }
end

---@param ctx TransferContext
---@return TransferResult
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

---@param ctx TransferContext
---@return TransferResult
function M.assignGod(ctx)
  if not check.can_access(ctx.user, LEVELS.SUPERGOD) then
    return { success = false, error = "Supergod required" }
  end
  return { success = true, action = "assign_god", userId = ctx.userId }
end

return M
