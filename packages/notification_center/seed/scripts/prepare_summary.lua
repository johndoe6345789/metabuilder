local calculate_total = require("calculate_total")
local get_severity_class = require("get_severity_class")

--- Default summary items
local default_items = {
  { label = "Info", count = 0, severity = "info" },
  { label = "Success", count = 0, severity = "success" },
  { label = "Warnings", count = 0, severity = "warning" },
  { label = "Errors", count = 0, severity = "error" }
}

--- Prepare summary data with enriched items
---@param props SummaryProps Summary configuration
---@return SummaryData Prepared summary data
local function prepare_summary(props)
  local title = props.title or "Notification Summary"
  local subtitle = props.subtitle
  local totalLabel = props.totalLabel or "Total"
  local items = props.items

  if not items or #items == 0 then
    items = default_items
  end

  local total = calculate_total(items)

  -- Enrich items with severity classes
  local enrichedItems = {}
  for i, item in ipairs(items) do
    enrichedItems[i] = {
      label = item.label,
      count = math.max(item.count or 0, 0),
      severity = item.severity or "info",
      hint = item.hint,
      classes = get_severity_class(item.severity)
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

return prepare_summary
