-- Stats grid component
require("stats.types")
local stats = require("stats")
local card = require("stats.card")

---@class StatsGrid
local M = {}

---Create a stats grid component
---@param props StatsGridProps
---@return UIComponent
function M.create(props)
  local items = stats.createStatItems(props.stats, props.config)
  local gridClass = props.gridClass or stats.getDefaultGridClass()

  -- Build card components
  local cards = {}
  for _, item in ipairs(items) do
    table.insert(cards, card.create(item, props.cardClass))
  end

  return {
    type = "Box",
    props = { className = gridClass },
    children = cards
  }
end

return M
