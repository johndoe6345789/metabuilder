-- Level 6 (Supergod) package initialization
local levels = require("ui_permissions.levels")

---@class UILevel6
local M = {}

---@type number
M.REQUIRED_LEVEL = levels.SUPERGOD

---@class User
---@field level number

---@class InitContext
---@field user User

---@class InitResult
---@field allowed boolean
---@field redirect? string

---@param context InitContext
---@return InitResult
function M.init(context)
  if context.user.level < M.REQUIRED_LEVEL then
    return { allowed = false, redirect = "/access-denied" }
  end
  return { allowed = true }
end

return M
