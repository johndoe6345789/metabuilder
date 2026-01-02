-- Date column definition

---@class DateColumn
---@field type "date" Column type identifier
---@field id string Column identifier
---@field label string Column header label
---@field format string Date format string (e.g., "YYYY-MM-DD")
---@field sortable boolean Whether the column is sortable

---Create a date column definition
---@param id string Column identifier
---@param label string Column header label
---@param format? string Date format string (default: "YYYY-MM-DD")
---@return DateColumn date_column The date column definition
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
