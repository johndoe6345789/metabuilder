-- Individual stat card component
require("stats.types")
local stats = require("stats")

---@class StatCard
local M = {}

---Create a single stat card
---@param item StatItem
---@param cardClass? string
---@return UIComponent
function M.create(item, cardClass)
  local colorClass = stats.getColorClass(item.color)
  local defaultCardClass = cardClass or stats.getDefaultCardClass()

  return {
    type = "Card",
    props = { className = defaultCardClass },
    children = {
      {
        type = "CardHeader",
        props = { className = "pb-2" },
        children = {
          {
            type = "CardTitle",
            props = {
              text = item.label,
              className = "text-sm font-medium text-gray-400"
            }
          }
        }
      },
      {
        type = "CardContent",
        children = {
          {
            type = "Box",
            props = {
              className = "text-2xl font-bold " .. colorClass
            },
            children = {
              {
                type = "Text",
                props = { text = tostring(item.value) }
              }
            }
          }
        }
      }
    }
  }
end

return M
