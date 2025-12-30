local check = require("check")
local LEVELS = require("levels")

---@class ModerationContext
---@field user table User object for permission checking
---@field targetId string ID of the target user for moderation action

---@class ActionResult
---@field success boolean Whether the action was successful
---@field error string? Error message if unsuccessful
---@field action string? Action type to perform
---@field id string? ID of the affected user

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

---Opens edit dialog for a user after permission verification
---@param ctx ModerationContext Context with user and targetId
---@return ActionResult Result with dialog action
function M.editUser(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, error = "Admin required" }
  end
  return { success = true, action = "open_edit_dialog", id = ctx.targetId }
end

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
