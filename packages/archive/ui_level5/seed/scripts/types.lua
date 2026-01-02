-- LuaCATS type definitions for ui_level5 package (God Panel)
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Render Context
--------------------------------------------------------------------------------

---@class RenderContext
---@field user User Current logged-in user (level 5+)
---@field currentTenant? Tenant Current tenant context

---@class User
---@field id string User ID
---@field username string Username
---@field level number Permission level (5 = GOD)
---@field tenantId string User's tenant ID

--------------------------------------------------------------------------------
-- Tenant Types
--------------------------------------------------------------------------------

---@class Tenant
---@field id string Tenant ID
---@field name string Tenant name
---@field slug string URL-safe identifier
---@field domain? string Custom domain
---@field status "active"|"suspended"|"pending" Tenant status
---@field plan "free"|"pro"|"enterprise" Subscription plan
---@field createdAt string ISO date string
---@field settings TenantSettings Tenant configuration

---@class TenantSettings
---@field maxUsers? number User limit
---@field maxStorage? number Storage limit in bytes
---@field features? string[] Enabled features
---@field branding? TenantBranding Custom branding

---@class TenantBranding
---@field logoUrl? string Logo URL
---@field primaryColor? string Brand color
---@field title? string Site title

---@class TenantStats
---@field userCount number Active users
---@field storageUsed number Bytes used
---@field workflowCount number Workflow count
---@field lastActive string ISO date string

--------------------------------------------------------------------------------
-- Power Transfer Types
--------------------------------------------------------------------------------

---@class PowerTransfer
---@field id string Transfer ID
---@field fromUserId string Source user ID
---@field toUserId string Destination user ID
---@field level number Level being transferred
---@field reason string Transfer reason
---@field status "pending"|"approved"|"rejected" Transfer status
---@field createdAt string ISO date string
---@field approvedBy? string Approver user ID

---@class TransferRequest
---@field toUserId string Target user ID
---@field level number Level to transfer
---@field reason string Justification
---@field duration? number Temporary transfer hours

---@class TransferResult
---@field success boolean Whether transfer succeeded
---@field transferId? string Created transfer ID
---@field error? string Error message

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

---@class SelectOption
---@field value string Option value
---@field label string Display label
---@field disabled? boolean Disable option

--------------------------------------------------------------------------------
-- God Panel Modules
--------------------------------------------------------------------------------

---@class TenantsModule
---@field list fun(): Tenant[] List all tenants
---@field get fun(id: string): Tenant Get tenant by ID
---@field create fun(data: Tenant): Tenant Create new tenant
---@field update fun(id: string, data: Tenant): Tenant Update tenant
---@field suspend fun(id: string, reason: string): Tenant Suspend tenant
---@field getStats fun(id: string): TenantStats Get tenant statistics

---@class TransferModule
---@field request fun(data: TransferRequest): TransferResult Request transfer
---@field approve fun(id: string): TransferResult Approve transfer
---@field reject fun(id: string, reason: string): TransferResult Reject transfer
---@field list fun(): PowerTransfer[] List pending transfers

---@class LayoutModule
---@field render fun(ctx: RenderContext): UIComponent Main layout renderer
---@field tabs fun(): UIComponent Tab navigation component

return {}
