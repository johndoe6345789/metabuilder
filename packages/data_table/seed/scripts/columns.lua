-- Column definition utilities

---@class Columns
local M = {}

---@class TextColumn
---@field type "text"
---@field id string Column identifier
---@field label string Column header label
---@field width string Column width (e.g., "auto", "100px")
---@field sortable boolean Whether the column is sortable

---@class NumberColumn
---@field type "number"
---@field id string Column identifier
---@field label string Column header label
---@field width string Column width (e.g., "100px")
---@field sortable boolean Whether the column is sortable
---@field align "right" Text alignment

---@class DateColumn
---@field type "date"
---@field id string Column identifier
---@field label string Column header label
---@field format string Date format string (e.g., "YYYY-MM-DD")
---@field sortable boolean Whether the column is sortable

---@class Action
---@field label string Action button label
---@field handler string Action handler name

---@class ActionColumn
---@field type "actions"
---@field id string Column identifier
---@field label string Column header label (typically empty)
---@field width string Column width (e.g., "120px")
---@field actions Action[] Array of actions

---@alias Column TextColumn | NumberColumn | DateColumn | ActionColumn

---Create a text column definition
---@param id string Column identifier
---@param label string Column header label
---@param width? string Column width (default: "auto")
---@return TextColumn
function M.text_column(id, label, width)
  return {
    type = "text",
    id = id,
    label = label,
    width = width or "auto",
    sortable = true
  }
end

---Create a number column definition
---@param id string Column identifier
---@param label string Column header label
---@param width? string Column width (default: "100px")
---@return NumberColumn
function M.number_column(id, label, width)
  return {
    type = "number",
    id = id,
    label = label,
    width = width or "100px",
    sortable = true,
    align = "right"
  }
end

---Create a date column definition
---@param id string Column identifier
---@param label string Column header label
---@param format? string Date format string (default: "YYYY-MM-DD")
---@return DateColumn
function M.date_column(id, label, format)
  return {
    type = "date",
    id = id,
    label = label,
    format = format or "YYYY-MM-DD",
    sortable = true
  }
end

---Create an action column definition
---@param id string Column identifier
---@param actions? Action[] Array of actions (default: {})
---@return ActionColumn
function M.action_column(id, actions)
  return {
    type = "actions",
    id = id,
    label = "",
    width = "120px",
    actions = actions or {}
  }
end

return M
