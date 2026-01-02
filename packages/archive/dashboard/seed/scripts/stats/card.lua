-- Create a stat card component
require("stats.types")

---@class StatCard
local M = {}

---@param props StatCardProps
---@return UIComponent
function M.create(props)
  -- Build children array with optional icon
  local contentChildren = {}

  -- Add icon if provided
  if props.icon then
    table.insert(contentChildren, {
      type = "Icon",
      props = { name = props.icon, size = "large", className = "mb-2" }
    })
  end

  -- Add label
  table.insert(contentChildren, {
    type = "Typography",
    props = { variant = "overline", text = props.label, className = "text-muted-foreground" }
  })

  -- Add value
  table.insert(contentChildren, {
    type = "Typography",
    props = { variant = "h4", text = tostring(props.value) }
  })

  -- Add change indicator if provided
  if props.change then
    table.insert(contentChildren, {
      type = "Typography",
      props = {
        variant = "caption",
        text = props.change,
        className = props.positive and "text-green-500" or "text-red-500"
      }
    })
  end

  return {
    type = "Card",
    props = { className = props.className },
    children = {
      {
        type = "CardContent",
        props = { className = "p-6" },
        children = contentChildren
      }
    }
  }
end

return M
