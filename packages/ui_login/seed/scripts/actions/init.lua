-- Actions module facade
-- Re-exports all action handlers for backward compatibility

local login = require("actions.handle_login")
local register = require("actions.handle_register")

---@class ActionsModule
---@field handleLogin fun(form: LoginForm): LoginSuccess|ActionFailure
---@field handleRegister fun(form: RegisterForm): RegisterSuccess|ActionFailure
local M = {}

M.handleLogin = login.handleLogin
M.handleRegister = register.handleRegister

return M
