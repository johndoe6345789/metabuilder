local validate = require("validate")

---@class LoginActions
local M = {}

---@class LoginForm
---@field username string
---@field password string

---@class RegisterForm
---@field username string
---@field email string
---@field password string

---@class ValidationError
---@field field string
---@field message string

---@class LoginSuccess
---@field success true
---@field action "login"
---@field username string

---@class RegisterSuccess
---@field success true
---@field action "register"
---@field username string
---@field email string

---@class ActionFailure
---@field success false
---@field errors ValidationError[]

---@param form LoginForm
---@return LoginSuccess|ActionFailure
function M.handleLogin(form)
  local result = validate.login(form)
  if not result.valid then
    return { success = false, errors = result.errors }
  end
  return { success = true, action = "login", username = form.username }
end

---@param form RegisterForm
---@return RegisterSuccess|ActionFailure
function M.handleRegister(form)
  local result = validate.register(form)
  if not result.valid then
    return { success = false, errors = result.errors }
  end
  return { success = true, action = "register", username = form.username, email = form.email }
end

return M
