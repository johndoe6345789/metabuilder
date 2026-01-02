-- Role information card component
require("role.types")
local role_module = require("role")

---@class RoleCard
local M = {}

---Create a role information card
---@param role UserRole
---@return UIComponent
function M.create(role)
  local info = role_module.getRoleInfo(role)

  -- Build highlights list
  local highlightItems = {}
  for _, highlight in ipairs(info.highlights) do
    table.insert(highlightItems, {
      type = "Box",
      props = { className = "flex items-center gap-2" },
      children = {
        {
          type = "Box",
          props = { className = "h-1.5 w-1.5 rounded-full bg-primary" }
        },
        {
          type = "Text",
          props = { text = highlight }
        }
      }
    })
  end

  return {
    type = "Box",
    props = { className = "rounded-md border p-3" },
    children = {
      -- Header with role name and capability count
      {
        type = "Box",
        props = { className = "flex items-center justify-between" },
        children = {
          {
            type = "Box",
            children = {
              {
                type = "Text",
                props = { text = info.label, className = "font-medium" }
              },
              {
                type = "Text",
                props = { text = info.blurb, className = "text-sm text-muted-foreground" }
              }
            }
          },
          {
            type = "Badge",
            props = {
              variant = "outline",
              text = #info.highlights .. " capabilities"
            }
          }
        }
      },
      -- Highlights grid
      {
        type = "Box",
        props = { className = "mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2" },
        children = highlightItems
      }
    }
  }
end

return M
