-- Level 6 (Supergod) package initialization
local levels = require("ui_permissions.levels")

local M = {}

M.REQUIRED_LEVEL = levels.SUPERGOD

function M.init(context)
  if context.user.level < M.REQUIRED_LEVEL then
    return { allowed = false, redirect = "/access-denied" }
  end
  return { allowed = true }
end

return M
