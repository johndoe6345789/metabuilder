-- Main render function for Level 4 layout

local tabs = require("layout.tabs")

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class User
---@field username string

---@class RenderContext
---@field nerdMode boolean
---@field user User

---Renders the main Level 4 application builder layout
---@param ctx RenderContext
---@return UIComponent
local function render(ctx)
  local desc = ctx.nerdMode
    and "Design declaratively with schemas and Lua scripts."
    or "Build visually with forms and drag-and-drop."
  return {
    type = "Box",
    props = { className = "min-h-screen bg-canvas" },
    children = {
      { type = "Level4Header", props = { username = ctx.user.username, nerdMode = ctx.nerdMode } },
      {
        type = "Container",
        props = { className = "max-w-7xl mx-auto px-4 py-8 space-y-8" },
        children = {
          { type = "IntroSection", props = { eyebrow = "Level 4", title = "Application Builder", description = desc } },
          tabs(ctx)
        }
      }
    }
  }
end

return render
