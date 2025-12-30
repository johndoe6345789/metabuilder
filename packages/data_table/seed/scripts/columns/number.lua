-- Number column definition

---@class NumberColumn
---@field type "number"
---@field id string Column identifier
---@field label string Column header label
---@field width string Column width (e.g., "100px")
---@field sortable boolean Whether the column is sortable
---@field align "right" Text alignment

---Create a number column definition
---@param id string Column identifier
---@param label string Column header label
---@param width? string Column width (default: "100px")
---@return NumberColumn
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
