-- Tenants module facade
-- Re-exports all tenant management functions for backward compatibility

local M = {}

M.tenant_list = require("tenants.tenant_list")
M.tenant_card = require("tenants.tenant_card")
M.create_tenant_form = require("tenants.create_tenant_form")

return M
