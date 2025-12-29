local M = {}

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
