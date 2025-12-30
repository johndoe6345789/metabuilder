--- Severity class mappings
local severity_classes = {
  info = "summary-item--info",
  success = "summary-item--success",
  warning = "summary-item--warning",
  error = "summary-item--error"
}

--- Get CSS class for severity level
---@param severity? NotificationSeverity Severity level
---@return string CSS class name
local function get_severity_class(severity)
  return severity_classes[severity or "info"] or severity_classes.info
end

return get_severity_class
