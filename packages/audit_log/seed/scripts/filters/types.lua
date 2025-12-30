-- Shared types for audit log filtering

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

---@class FilterOptions
---@field operations string[] List of unique operations
---@field resources string[] List of unique resources
---@field usernames string[] List of unique usernames

---@class ApplyFiltersInput
---@field operation string? Filter by operation type
---@field resource string? Filter by resource type
---@field success boolean? Filter by success status
---@field username string? Filter by username (partial match)
---@field startTime number? Filter from this timestamp
---@field endTime number? Filter until this timestamp

return {}
