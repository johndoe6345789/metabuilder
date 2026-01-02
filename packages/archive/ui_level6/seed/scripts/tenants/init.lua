-- Tenants module facade
-- Re-exports all tenant management functions for backward compatibility

---@class TenantsModule
---@field tenant_list fun(): TenantListComponent
---@field tenant_card fun(tenant: TenantInfo): TenantCardComponent
---@field create_tenant_form fun(): FormComponent
---@type TenantsModule
local M = {}

M.tenant_list = require("tenants.tenant_list")
M.tenant_card = require("tenants.tenant_card")
M.create_tenant_form = require("tenants.create_tenant_form")

return M
