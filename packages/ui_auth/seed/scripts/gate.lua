local check = require("check")

---@class AuthGate
local M = {}

---@class User
---@field id string
---@field level? number

---@class GateContext
---@field user? User
---@field requiredLevel? number
---@field children? table

---@class CheckResult
---@field allowed boolean
---@field reason? string
---@field redirect? string

---@class UIComponent
---@field type string
---@field props? table

---@param ctx GateContext
---@return CheckResult
function M.check(ctx)
  if not ctx.user then
    return { allowed = false, reason = "not_authenticated", redirect = "/login" }
  end
  if ctx.requiredLevel and not check.can_access(ctx.user, ctx.requiredLevel) then
    return { allowed = false, reason = "insufficient_permission" }
  end
  return { allowed = true }
end

---@param ctx GateContext
---@return UIComponent|table
function M.wrap(ctx)
  local result = M.check(ctx)
  if not result.allowed then
    if result.redirect then
      return { type = "Redirect", props = { to = result.redirect } }
    end
    return { type = "AccessDenied", props = { reason = result.reason } }
  end
  return ctx.children
end

return M
