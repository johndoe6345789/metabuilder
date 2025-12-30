-- Shared types for audit log formatting

---@class AuditLog
---@field id string Unique log entry ID
---@field operation string Operation type (create, read, update, delete)
---@field resource string Resource type being accessed
---@field resourceId string ID of the resource
---@field username string User who performed the action
---@field timestamp number Unix timestamp in milliseconds
---@field ipAddress string IP address of the request
---@field success boolean Whether the operation succeeded
---@field errorMessage string? Error message if failed

---@class FormattedLogEntry
---@field id string
---@field operation string
---@field operationColor string CSS class for operation badge
---@field resource string
---@field resourceId string
---@field resourceIcon string Icon name for resource type
---@field username string
---@field timestamp string Formatted date/time string
---@field ipAddress string
---@field success boolean
---@field errorMessage string?
---@field rowClass string CSS class for table row

return {}
