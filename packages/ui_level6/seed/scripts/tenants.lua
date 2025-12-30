-- Tenant management for supergod
local M = {}

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
