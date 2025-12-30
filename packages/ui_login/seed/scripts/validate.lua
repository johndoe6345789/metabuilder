---@class ValidationError
---@field field string
---@field message string

---@class ValidationResult
---@field valid boolean
---@field errors ValidationError[]

---@class LoginData
---@field username string?
---@field password string?

---@class RegisterData
---@field username string?
---@field email string?
---@field password string?

local M = {}

---Validate login credentials
---@param data LoginData
---@return ValidationResult
function M.login(data)
  local errors = {}
  if not data.username or data.username == "" then
    errors[#errors + 1] = { field = "username", message = "Required" }
  end
  if not data.password or #data.password < 6 then
    errors[#errors + 1] = { field = "password", message = "Min 6 chars" }
  end
  return { valid = #errors == 0, errors = errors }
end

---Validate registration data
---@param data RegisterData
---@return ValidationResult
function M.register(data)
  local errors = {}
  if not data.username or #data.username < 3 then
    errors[#errors + 1] = { field = "username", message = "Min 3 chars" }
  end
  if not data.email or not string.match(data.email, "^[^@]+@[^@]+%.[^@]+$") then
    errors[#errors + 1] = { field = "email", message = "Invalid email" }
  end
  if not data.password or #data.password < 8 then
    errors[#errors + 1] = { field = "password", message = "Min 8 chars" }
  end
  return { valid = #errors == 0, errors = errors }
end

return M
