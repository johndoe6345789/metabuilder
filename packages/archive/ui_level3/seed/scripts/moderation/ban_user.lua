-- Ban user moderation action
-- Single function module for admin moderation

local check = require("check")
local LEVELS = require("levels")

---@class BanUser
local M = {}

---Bans a user account after permission verification
---@param ctx ModerationContext Context with user and targetId
---@return ActionResult Result of the ban operation
function M.banUser(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, error = "Admin required" }
  end
  return { success = true, action = "ban_user", id = ctx.targetId }
end

return M
