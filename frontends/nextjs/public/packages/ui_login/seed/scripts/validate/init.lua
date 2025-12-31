-- Validation module facade
-- Re-exports all validation functions for backward compatibility

local login_mod = require("validate.login")
local register_mod = require("validate.register")

---@class ValidateModule
---@field login fun(data: LoginData): ValidationResult
---@field register fun(data: RegisterData): ValidationResult
local M = {}

M.login = login_mod.login
M.register = register_mod.register

return M
