-- Tenant card component

---@class TenantInfo
---@field id string
---@field name string
---@field owner string
---@field userCount number
---@field status string

---@class TenantCardComponent
---@field type string
---@field id string
---@field name string
---@field owner string
---@field userCount number
---@field status string

---Returns a tenant card component for the given tenant
---@param tenant TenantInfo
---@return TenantCardComponent
local function tenant_card(tenant)
  return {
    type = "tenant_card",
    id = tenant.id,
    name = tenant.name,
    owner = tenant.owner,
    userCount = tenant.userCount,
    status = tenant.status
  }
end

return tenant_card
