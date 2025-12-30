-- Wrap content with auth gate

local check_module = require("gate.check")

---@class GateContext
---@field user? table
---@field requiredLevel? number
---@field children? table

---@class UIComponent
---@field type string
---@field props? table

local M = {}

---Wrap content with authentication/authorization gate
---@param ctx GateContext
---@return UIComponent|table
function M.wrap(ctx)
  local result = check_module.check(ctx)
  
  if not result.allowed then
    if result.redirect then
      return { type = "Redirect", props = { to = result.redirect } }
    end
    return { type = "AccessDenied", props = { reason = result.reason } }
  end
  
  return ctx.children
end

return M
