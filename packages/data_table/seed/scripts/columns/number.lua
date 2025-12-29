-- Number column definition
local function number_column(id, label, width)
  return {
    type = "number",
    id = id,
    label = label,
    width = width or "100px",
    sortable = true,
    align = "right"
  }
end

return number_column
