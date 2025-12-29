local check = require("check")
local LEVELS = require("levels")
local M = {}

function M.toLevel2(ctx)
  if not check.can_access(ctx.user, LEVELS.USER) then
    return { success = false, redirect = "/login" }
  end
  return { success = true, route = "/level2" }
end

function M.toLevel3(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, message = "Admin required" }
  end
  return { success = true, route = "/level3" }
end

function M.openDocs()
  return { success = true, action = "external", url = "/docs" }
end

return M
