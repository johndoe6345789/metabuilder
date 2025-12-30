---@class Stats
local M = {}

---@class UIComponent
---@field type string
---@field props? table
---@field children? table

---@class StatCardProps
---@field label string
---@field value number|string
---@field change? string
---@field positive? boolean
---@field className? string

---@param props StatCardProps
---@return UIComponent
function M.card(props)
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

---@param stats StatCardProps[]
---@return UIComponent
function M.grid(stats)
  local items = {}
  for _, s in ipairs(stats) do
    items[#items + 1] = M.card(s)
  end
  return {
    type = "Grid",
    props = { cols = #stats > 4 and 4 or #stats, gap = 4 },
    children = items
  }
end

return M
