local check = require("check")
local LEVELS = require("levels")
local M = {}

function M.deleteUser(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, error = "Admin required" }
  end
  if ctx.targetId == ctx.user.id then
    return { success = false, error = "Cannot delete yourself" }
  end
  return { success = true, action = "delete_user", id = ctx.targetId }
end

function M.editUser(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, error = "Admin required" }
  end
  return { success = true, action = "open_edit_dialog", id = ctx.targetId }
end

function M.banUser(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, error = "Admin required" }
  end
  return { success = true, action = "ban_user", id = ctx.targetId }
end

return M
