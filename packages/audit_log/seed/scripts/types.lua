-- LuaCATS type definitions for audit_log package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Audit Entry Types
--------------------------------------------------------------------------------

---@class AuditLogEntry
---@field id string Entry ID
---@field timestamp string ISO date string
---@field operation "create"|"read"|"update"|"delete"|"login"|"logout"|"other" Operation type
---@field entity string Entity/table name
---@field entityId? string Target entity ID
---@field userId string Acting user ID
---@field username string Acting username
---@field userLevel number User's permission level
---@field tenantId string Tenant context
---@field details table<string, any> Operation details
---@field ipAddress? string Client IP address
---@field userAgent? string Client user agent

---@class AuditChange
---@field field string Changed field name
---@field oldValue any Previous value
---@field newValue any New value

---@class AuditEntryWithChanges : AuditLogEntry
---@field changes AuditChange[] Field-level changes

--------------------------------------------------------------------------------
-- Filter Types
--------------------------------------------------------------------------------

---@class AuditFilter
---@field operation? string Filter by operation type
---@field entity? string Filter by entity name
---@field userId? string Filter by acting user
---@field startDate? string ISO date string
---@field endDate? string ISO date string
---@field limit? number Max results
---@field offset? number Skip results

---@class FilterResult
---@field entries AuditLogEntry[] Matching entries
---@field total number Total matching count
---@field hasMore boolean More results available

--------------------------------------------------------------------------------
-- Formatting Types
--------------------------------------------------------------------------------

---@alias TimeFormat "relative"|"absolute"|"iso"

---@class FormattingOptions
---@field timeFormat? TimeFormat How to format timestamps
---@field includeDetails? boolean Include full details
---@field highlightChanges? boolean Highlight changed fields

---@class FormattedEntry
---@field id string Entry ID
---@field timeDisplay string Formatted timestamp
---@field summary string Human-readable summary
---@field badge table Badge display info
---@field expandable boolean Has expandable details

--------------------------------------------------------------------------------
-- Statistics Types
--------------------------------------------------------------------------------

---@class AuditStats
---@field totalEntries number Total log entries
---@field entriesByOperation table<string, number> Count per operation
---@field entriesByEntity table<string, number> Count per entity
---@field topUsers table<string, number> Most active users
---@field recentActivity number Entries in last 24h

---@class ActivityTrend
---@field date string Date (YYYY-MM-DD)
---@field count number Entry count
---@field operations table<string, number> Breakdown by operation

--------------------------------------------------------------------------------
-- Audit Modules
--------------------------------------------------------------------------------

---@class FiltersModule
---@field apply fun(entries: AuditLogEntry[], filter: AuditFilter): FilterResult Apply filters
---@field byOperation fun(entries: AuditLogEntry[], op: string): AuditLogEntry[] Filter by operation
---@field byDateRange fun(entries: AuditLogEntry[], start: string, end_: string): AuditLogEntry[] Filter by date
---@field byUser fun(entries: AuditLogEntry[], userId: string): AuditLogEntry[] Filter by user

---@class FormattingModule
---@field formatEntry fun(entry: AuditLogEntry, options?: FormattingOptions): FormattedEntry
---@field formatTime fun(timestamp: string, format?: TimeFormat): string
---@field generateSummary fun(entry: AuditLogEntry): string

---@class StatsModule
---@field calculate fun(entries: AuditLogEntry[]): AuditStats
---@field getTrends fun(entries: AuditLogEntry[], days?: number): ActivityTrend[]
---@field getTopEntities fun(entries: AuditLogEntry[], limit?: number): table<string, number>

return {}
