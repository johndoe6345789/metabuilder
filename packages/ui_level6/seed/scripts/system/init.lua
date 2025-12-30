-- System administration module facade
-- Re-exports all system functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class System
local M = {}

-- Import all single-function modules
local systemStats = require("system.system_stats")
local systemHealth = require("system.system_health")
local systemLogs = require("system.system_logs")
local maintenanceMode = require("system.maintenance_mode")

-- Re-export all functions
M.system_stats = systemStats.system_stats
M.system_health = systemHealth.system_health
M.system_logs = systemLogs.system_logs
M.maintenance_mode = maintenanceMode.maintenance_mode

return M
