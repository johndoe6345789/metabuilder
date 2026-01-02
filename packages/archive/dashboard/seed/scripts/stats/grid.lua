-- Create a grid of stat cards
require("stats.types")
local card = require("stats.card")

---@class StatGrid
local M = {}

---@param stats StatCardProps[]
---@return UIComponent
function M.create(stats)
  local items = {}
  for _, s in ipairs(stats) do
    items[#items + 1] = card.create(s)
  end
  return {
    type = "Grid",
    props = { cols = #stats > 4 and 4 or #stats, gap = 4 },
    children = items
  }
end

return M
