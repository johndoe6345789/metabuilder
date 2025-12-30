-- Notification summary card component logic
local json = require("json")
local M = {}

-- Load config from JSON file
local config = json.load("summary.json")
M.severityClasses = config.severityClasses
M.defaultItems = config.defaultItems

-- Calculate total from items
function M.calculateTotal(items)
  local total = 0
  for _, item in ipairs(items) do
    local count = item.count or 0
    if count > 0 then
      total = total + count
    end
  end
  return total
end

-- Get severity class for an item
function M.getSeverityClass(severity)
  return M.severityClasses[severity or "info"] or M.severityClasses.info
end

-- Prepare summary data
function M.prepareSummary(props)
  local title = props.title or "Notification Summary"
  local subtitle = props.subtitle
  local totalLabel = props.totalLabel or "Total"
  local items = props.items
  
  if not items or #items == 0 then
    items = M.defaultItems
  end
  
  local total = M.calculateTotal(items)
  
  -- Enrich items with severity classes
  local enrichedItems = {}
  for i, item in ipairs(items) do
    enrichedItems[i] = {
      label = item.label,
      count = math.max(item.count or 0, 0),
      severity = item.severity or "info",
      hint = item.hint,
      classes = M.getSeverityClass(item.severity)
    }
  end
  
  return {
    title = title,
    subtitle = subtitle,
    totalLabel = totalLabel,
    total = total,
    items = enrichedItems
  }
end

return M
