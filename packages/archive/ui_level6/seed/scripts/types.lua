-- LuaCATS type definitions for ui_level6 package (Supergod Panel)
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Render Context
--------------------------------------------------------------------------------

---@class RenderContext
---@field user User Current logged-in user (level 6)

---@class User
---@field id string User ID
---@field username string Username
---@field level number Permission level (6 = SUPERGOD)

--------------------------------------------------------------------------------
-- System Administration Types
--------------------------------------------------------------------------------

---@class SystemConfig
---@field maintenance boolean Maintenance mode enabled
---@field debugMode boolean Debug logging enabled
---@field maxUploadSize number Max upload size in bytes
---@field allowedOrigins string[] CORS origins
---@field rateLimits RateLimitConfig Rate limiting config
---@field features FeatureFlags Feature toggles

---@class RateLimitConfig
---@field requestsPerMinute number API rate limit
---@field loginAttemptsPerHour number Login attempt limit
---@field uploadLimitPerDay number Daily upload limit

---@class FeatureFlags
---@field [string] boolean Feature name to enabled state

---@class SystemHealth
---@field status "healthy"|"degraded"|"down" Overall status
---@field database DatabaseHealth Database status
---@field cache CacheHealth Cache status
---@field storage StorageHealth Storage status
---@field uptime number Uptime in seconds
---@field lastCheck string ISO date string

---@class DatabaseHealth
---@field connected boolean Is connected
---@field latencyMs number Query latency
---@field poolSize number Connection pool size
---@field activeConnections number Active connections

---@class CacheHealth
---@field connected boolean Is connected
---@field hitRate number Cache hit percentage
---@field memoryUsed number Bytes used

---@class StorageHealth
---@field available boolean Is available
---@field usedBytes number Storage used
---@field totalBytes number Total capacity

--------------------------------------------------------------------------------
-- Tenant Management (Global)
--------------------------------------------------------------------------------

---@class GlobalTenant
---@field id string Tenant ID
---@field name string Tenant name
---@field status "active"|"suspended"|"pending"|"deleted" Tenant status
---@field plan "free"|"pro"|"enterprise" Subscription plan
---@field ownerEmail string Owner email
---@field createdAt string ISO date string
---@field deletedAt? string Soft delete timestamp

---@class TenantAction
---@field action "activate"|"suspend"|"delete"|"restore" Action type
---@field tenantId string Target tenant
---@field reason? string Action reason

---@class TenantActionResult
---@field success boolean Action succeeded
---@field tenant? GlobalTenant Updated tenant
---@field error? string Error message

--------------------------------------------------------------------------------
-- Power Transfer (Global)
--------------------------------------------------------------------------------

---@class GlobalTransfer
---@field id string Transfer ID
---@field fromUserId string Source user ID
---@field fromUsername string Source username
---@field toUserId string Destination user ID
---@field toUsername string Destination username
---@field level number Level being transferred
---@field tenantId string Tenant context
---@field status "pending"|"approved"|"rejected"|"expired" Status
---@field createdAt string ISO date string

--------------------------------------------------------------------------------
-- Audit Log
--------------------------------------------------------------------------------

---@class AuditEntry
---@field id string Entry ID
---@field action string Action performed
---@field actorId string User who performed action
---@field actorUsername string Actor username
---@field targetType "user"|"tenant"|"system"|"transfer" Target type
---@field targetId string Target ID
---@field details table<string, any> Action details
---@field timestamp string ISO date string
---@field ipAddress? string Client IP

---@class AuditFilter
---@field action? string Filter by action
---@field actorId? string Filter by actor
---@field targetType? string Filter by target type
---@field startDate? string Filter start date
---@field endDate? string Filter end date

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

---@class AlertProps
---@field severity "info"|"warning"|"error"|"success" Alert type
---@field title? string Alert title
---@field message string Alert message

--------------------------------------------------------------------------------
-- Supergod Modules
--------------------------------------------------------------------------------

---@class SystemModule
---@field getConfig fun(): SystemConfig Get system configuration
---@field updateConfig fun(config: SystemConfig): SystemConfig Update configuration
---@field getHealth fun(): SystemHealth Get system health status
---@field setMaintenance fun(enabled: boolean, message?: string): SystemConfig Toggle maintenance
---@field clearCache fun(): boolean Clear all caches

---@class GlobalTenantsModule
---@field list fun(filter?: table): GlobalTenant[] List all tenants
---@field action fun(data: TenantAction): TenantActionResult Perform tenant action
---@field getStats fun(): table<string, number> Get global statistics

---@class GlobalTransferModule
---@field listAll fun(): GlobalTransfer[] List all pending transfers
---@field override fun(id: string, decision: "approve"|"reject"): GlobalTransfer Override decision

---@class AuditModule
---@field query fun(filter?: AuditFilter): AuditEntry[] Query audit log
---@field export fun(filter?: AuditFilter, format?: "json"|"csv"): string Export log

---@class LayoutModule
---@field render fun(ctx: RenderContext): UIComponent Main layout renderer
---@field tabs fun(): UIComponent Tab navigation component

return {}
