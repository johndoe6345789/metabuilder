-- Tenant management for supergod

---@class ColumnDefinition
---@field id string
---@field label string
---@field type? string

---@class TenantListComponent
---@field type string
---@field columns ColumnDefinition[]

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

---@class FormField
---@field id string
---@field type string
---@field label string
---@field required? boolean
---@field options? string[]

---@class FormComponent
---@field type string
---@field id string
---@field fields FormField[]

local M = {}

---@return TenantListComponent
function M.tenant_list()
  return {
    type = "tenant_list",
    columns = {
      { id = "name", label = "Tenant Name" },
      { id = "owner", label = "Owner" },
      { id = "users", label = "Users", type = "number" },
      { id = "status", label = "Status", type = "badge" },
      { id = "actions", label = "", type = "actions" }
    }
  }
end

---@param tenant TenantInfo
---@return TenantCardComponent
function M.tenant_card(tenant)
  return {
    type = "tenant_card",
    id = tenant.id,
    name = tenant.name,
    owner = tenant.owner,
    userCount = tenant.userCount,
    status = tenant.status
  }
end

---@return FormComponent
function M.create_tenant_form()
  return {
    type = "form",
    id = "create_tenant",
    fields = {
      { id = "name", type = "text", label = "Tenant Name", required = true },
      { id = "owner", type = "user_select", label = "Owner", required = true },
      { id = "plan", type = "select", label = "Plan", options = { "free", "pro", "enterprise" } }
    }
  }
end

return M
