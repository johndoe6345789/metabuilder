-- Form validation email rule

---@class ValidationRule
---@field type string
---@field pattern? string
---@field value? number | string
---@field message string

---@param message? string
---@return ValidationRule
local function email(message)
  return {
    type = "email",
    pattern = "^[^@]+@[^@]+%.[^@]+$",
    message = message or "Please enter a valid email"
  }
end

return email
