-- Main admin panel layout renderer

---@class LayoutContext
---@field user table
---@field userCount integer
---@field commentCount integer
---@field flaggedCount integer

---@class UIComponent
---@field type string
---@field props table?
---@field children table[]?

local stats = require("layout.stats")
local tabs = require("layout.tabs")

local M = {}

---Renders the main admin panel layout
---@param ctx LayoutContext Context data for rendering
---@return UIComponent Box component with admin panel layout
function M.render(ctx)
  return {
    type = "Box",
    props = { className = "min-h-screen bg-background" },
    children = {
      {
        type = "AppHeader",
        props = {
          title = "Admin Panel",
          username = ctx.user.username,
          showBadge = true,
          variant = "admin"
        }
      },
      {
        type = "Container",
        props = { className = "max-w-7xl mx-auto px-4 py-8 space-y-8" },
        children = {
          {
            type = "IntroSection",
            props = {
              eyebrow = "Level 3",
              title = "Data Management",
              description = "Manage users and content."
            }
          },
          stats.stats(ctx),
          tabs.tabs()
        }
      }
    }
  }
end

return M
