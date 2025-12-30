-- Gate module facade
-- Re-exports all gate functions for backward compatibility

local check_mod = require("gate.check")
local wrap_mod = require("gate.wrap")

---@class GateModule
---@field check fun(ctx: GateContext): CheckResult
---@field wrap fun(ctx: GateContext): UIComponent|table
local M = {}

M.check = check_mod.check
M.wrap = wrap_mod.wrap

return M
