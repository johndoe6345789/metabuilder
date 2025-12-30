-- Home page navigation handlers

local check = require("check")
local LEVELS = require("levels")

---@class Context
---@field user? table

---@class NavigationResult
---@field success boolean
---@field redirect? string
---@field route? string
---@field message? string
---@field action? string
---@field url? string

local M = {}

---@param ctx Context
---@return NavigationResult
function M.toLevel2(ctx)
  if not check.can_access(ctx.user, LEVELS.USER) then
    return { success = false, redirect = "/login" }
  end
  return { success = true, route = "/level2" }
end

---@param ctx Context
---@return NavigationResult
function M.toLevel3(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, message = "Admin required" }
  end
  return { success = true, route = "/level3" }
end

---@return NavigationResult
function M.openDocs()
  return { success = true, action = "external", url = "/docs" }
end

return M
