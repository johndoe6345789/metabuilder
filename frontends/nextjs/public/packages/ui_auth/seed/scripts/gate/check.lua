-- Check user access permissions

local check = require("check")

---@class User
---@field id string
---@field level? number

---@class GateContext
---@field user? User
---@field requiredLevel? number

---@class CheckResult
---@field allowed boolean
---@field reason? string
---@field redirect? string

local M = {}

---Check if user has required access level
---@param ctx GateContext
---@return CheckResult
function M.check(ctx)
  if not ctx.user then
    return {
      allowed = false,
      reason = "not_authenticated",
      redirect = "/login"
    }
  end
  
  if ctx.requiredLevel and not check.can_access(ctx.user, ctx.requiredLevel) then
    return {
      allowed = false,
      reason = "insufficient_permission"
    }
  end
  
  return { allowed = true }
end

return M
