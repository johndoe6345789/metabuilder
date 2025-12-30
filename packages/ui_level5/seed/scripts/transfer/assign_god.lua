-- Assign god role to user

local check = require("check")
local LEVELS = require("levels")

---@class User
---@field id string

---@class TransferContext
---@field user User
---@field userId? string

---@class TransferResult
---@field success boolean
---@field error? string
---@field action? string
---@field userId? string

local M = {}

---Assign god-level permissions to a user
---@param ctx TransferContext
---@return TransferResult
function M.assignGod(ctx)
  if not check.can_access(ctx.user, LEVELS.SUPERGOD) then
    return { success = false, error = "Supergod required" }
  end
  return {
    success = true,
    action = "assign_god",
    userId = ctx.userId
  }
end

return M
