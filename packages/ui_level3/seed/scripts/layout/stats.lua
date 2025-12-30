-- Stats grid component for admin panel

---@class LayoutContext
---@field userCount integer
---@field commentCount integer
---@field flaggedCount integer

---@class UIComponent
---@field type string
---@field props table?
---@field children table[]?

local M = {}

---Creates stats grid component with user and content statistics
---@param ctx LayoutContext Context data containing statistics
---@return UIComponent Grid component with stat cards
function M.stats(ctx)
  return {
    type = "Grid",
    props = { cols = 3, gap = 4 },
    children = {
      {
        type = "StatCard",
        props = { label = "Users", value = ctx.userCount or 0 }
      },
      {
        type = "StatCard",
        props = { label = "Comments", value = ctx.commentCount or 0 }
      },
      {
        type = "StatCard",
        props = { label = "Flagged", value = ctx.flaggedCount or 0 }
      }
    }
  }
end

return M
