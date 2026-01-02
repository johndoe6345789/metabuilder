-- Validate login credentials

---@class ValidationError
---@field field string
---@field message string

---@class ValidationResult
---@field valid boolean
---@field errors ValidationError[]

---@class LoginData
---@field username string?
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

return M
