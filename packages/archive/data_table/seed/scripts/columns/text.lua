-- Text column definition

---@class TextColumn
---@field type "text" Column type identifier
---@field id string Column identifier
---@field label string Column header label
---@field width string Column width (e.g., "auto", "100px")
---@field sortable boolean Whether the column is sortable

---Create a text column definition
---@param id string Column identifier
---@param label string Column header label
---@param width? string Column width (default: "auto")
---@return TextColumn text_column The text column definition
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
