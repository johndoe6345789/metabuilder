-- Handle registration form submission

local validate = require("validate")

---@class RegisterForm
---@field username string
---@field email string
---@field password string

---@class ValidationError
---@field field string
---@field message string

---@class RegisterSuccess
---@field success true
---@field action "register"
---@field username string
---@field email string

---@class ActionFailure
---@field success false
---@field errors ValidationError[]

local M = {}

---Process registration form and validate data
---@param form RegisterForm
---@return RegisterSuccess|ActionFailure
function M.handleRegister(form)
  local result = validate.register(form)
  if not result.valid then
    return { success = false, errors = result.errors }
  end
  return {
    success = true,
    action = "register",
    username = form.username,
    email = form.email
  }
end

return M
