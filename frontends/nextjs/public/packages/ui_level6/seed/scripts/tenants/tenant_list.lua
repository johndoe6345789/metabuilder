-- Tenant list component

---@class ColumnDefinition
---@field id string
---@field label string
---@field type? string

---@class TenantListComponent
---@field type string
---@field columns ColumnDefinition[]

---Returns the tenant list component configuration
---@return TenantListComponent
local function tenant_list()
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

return tenant_list
