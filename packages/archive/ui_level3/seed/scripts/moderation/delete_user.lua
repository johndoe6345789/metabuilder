-- Delete user moderation action
-- Single function module for admin moderation

local check = require("check")
local LEVELS = require("levels")

---@class DeleteUser
local M = {}

---Deletes a user account after permission verification
---@param ctx ModerationContext Context with user and targetId
---@return ActionResult Result of the delete operation
function M.deleteUser(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, error = "Admin required" }
  end
  if ctx.targetId == ctx.user.id then
    return { success = false, error = "Cannot delete yourself" }
  end
  return { success = true, action = "delete_user", id = ctx.targetId }
end

return M
