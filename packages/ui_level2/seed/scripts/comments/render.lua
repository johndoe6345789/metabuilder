-- Render comments section
-- Single function module for comments UI

local composer = require("comments.composer")
local list = require("comments.list")

---@class Render
local M = {}

---Render full comments section
---@param ctx RenderContext Context with comments array
---@return UIComponent
function M.render(ctx)
  return {
    type = "Stack",
    props = { spacing = 4 },
    children = {
      composer.composer(),
      list.list(ctx.comments or {})
    }
  }
end

return M
