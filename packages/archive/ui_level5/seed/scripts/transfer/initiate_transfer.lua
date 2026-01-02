-- Initiate ownership transfer

local check = require("check")
local LEVELS = require("levels")

---@class User
---@field id string

---@class TransferContext
---@field user User
---@field tenantId? string

---@class TransferResult
---@field success boolean
---@field error? string
---@field action? string
---@field tenantId? string

local M = {}

---Initiate a tenant ownership transfer dialog
---@param ctx TransferContext
---@return TransferResult
function M.initiateTransfer(ctx)
  if not check.can_access(ctx.user, LEVELS.SUPERGOD) then
    return { success = false, error = "Supergod required" }
  end
  return {
    success = true,
    action = "open_transfer_dialog",
    tenantId = ctx.tenantId
  }
end

return M
