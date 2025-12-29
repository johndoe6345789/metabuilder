-- Text column definition
local function text_column(id, label, width)
  return {
    type = "text",
    id = id,
    label = label,
    width = width or "auto",
    sortable = true
  }
end

return text_column
