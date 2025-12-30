-- Dashboard flex layout
local function flex(direction, gap, align)
  return {
    type = "flex",
    direction = direction or "row",
    gap = gap or 16,
    align = align or "stretch"
  }
end

return flex
