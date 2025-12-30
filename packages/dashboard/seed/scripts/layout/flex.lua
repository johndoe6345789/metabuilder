-- Dashboard flex layout

---@class FlexLayoutConfig
---@field type string
---@field direction string
---@field gap number
---@field align string

---@param direction? string Direction of flex layout (default: "row")
---@param gap? number Gap between items in pixels (default: 16)
---@param align? string Alignment of items (default: "stretch")
---@return FlexLayoutConfig
local function flex(direction, gap, align)
  return {
    type = "flex",
    direction = direction or "row",
    gap = gap or 16,
    align = align or "stretch"
  }
end

return flex
