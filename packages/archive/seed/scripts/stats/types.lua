-- Shared types for audit log statistics

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

---@class AuditStats
---@field total number Total number of log entries
---@field successful number Count of successful operations
---@field failed number Count of failed operations
---@field rateLimit number Count of rate limited operations

---@class OperationStats
---@field total number Total operations of this type
---@field successful number Successful operations
---@field failed number Failed operations

---@class StatCard
---@field title string Display title
---@field value number Numeric value
---@field icon string Icon name
---@field color string Color theme

---@class StatsDisplay
---@field cards StatCard[] Array of stat cards to display
---@field byOperation table<string, OperationStats> Stats grouped by operation
---@field byResource table<string, OperationStats> Stats grouped by resource

return {}
