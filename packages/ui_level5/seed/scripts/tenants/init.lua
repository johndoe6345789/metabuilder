-- Tenant management module facade
-- Re-exports all tenant functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class Tenants
local M = {}

-- Import all single-function modules
local render = require("tenants.render")
local createTenant = require("tenants.create_tenant")
local deleteTenant = require("tenants.delete_tenant")

-- Re-export all functions
M.render = render.render
M.createTenant = createTenant.createTenant
M.deleteTenant = deleteTenant.deleteTenant

return M
