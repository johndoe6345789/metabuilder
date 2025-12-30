-- Create a stat card component
require("stats.types")

---@class StatCard
local M = {}

---@param props StatCardProps
---@return UIComponent
function M.create(props)
  return {
    type = "Card",
    props = { className = props.className },
    children = {
      {
        type = "CardContent",
        props = { className = "p-6" },
        children = {
          { type = "Typography", props = { variant = "overline", text = props.label, className = "text-muted-foreground" } },
          { type = "Typography", props = { variant = "h4", text = tostring(props.value) } },
          props.change and {
            type = "Typography",
            props = { variant = "caption", text = props.change, className = props.positive and "text-green-500" or "text-red-500" }
          } or nil
        }
      }
    }
  }
end

return M
