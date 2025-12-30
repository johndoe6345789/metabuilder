-- Edit user moderation action
-- Single function module for admin moderation

local check = require("check")
local LEVELS = require("levels")

---@class EditUser
local M = {}

---Opens edit dialog for a user after permission verification
---@param ctx ModerationContext Context with user and targetId
---@return ActionResult Result with dialog action
function M.editUser(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, error = "Admin required" }
  end
  return { success = true, action = "open_edit_dialog", id = ctx.targetId }
end

return M
