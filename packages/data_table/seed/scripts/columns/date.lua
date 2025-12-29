-- Date column definition
local function date_column(id, label, format)
  return {
    type = "date",
    id = id,
    label = label,
    format = format or "YYYY-MM-DD",
    sortable = true
  }
end

return date_column
