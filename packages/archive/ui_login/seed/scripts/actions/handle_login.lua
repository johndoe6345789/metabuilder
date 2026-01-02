-- Handle login form submission

local validate = require("validate")

---@class LoginForm
---@field username string
---@field password string

---@class ValidationError
---@field field string
---@field message string

---@class LoginSuccess
---@field success true
---@field action "login"
---@field username string

---@class ActionFailure
---@field success false
---@field errors ValidationError[]

local M = {}

---Process login form and validate credentials
---@param form LoginForm
---@return LoginSuccess|ActionFailure
function M.handleLogin(form)
  local result = validate.login(form)
  if not result.valid then
    return { success = false, errors = result.errors }
  end
  return {
    success = true,
    action = "login",
    username = form.username
  }
end

return M
