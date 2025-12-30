-- Dashboard stat row layout
local function stat_row(stats)
  return {
    type = "row",
    layout = "flex",
    gap = 16,
    children = stats
  }
end

return stat_row
