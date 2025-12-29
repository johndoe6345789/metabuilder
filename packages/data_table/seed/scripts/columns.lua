-- Column definition utilities
local M = {}

function M.text_column(id, label, width)
  return {
    type = "text",
    id = id,
    label = label,
    width = width or "auto",
    sortable = true
  }
end

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

function M.date_column(id, label, format)
  return {
    type = "date",
    id = id,
    label = label,
    format = format or "YYYY-MM-DD",
    sortable = true
  }
end

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
