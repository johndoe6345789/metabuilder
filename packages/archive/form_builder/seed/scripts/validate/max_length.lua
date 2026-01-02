-- Form validation max length rule

---@class ValidationRule
---@field type string
---@field pattern? string
---@field value? number | string
---@field message string

---@param length number
---@param message? string
---@return ValidationRule
local function max_length(length, message)
  return {
    type = "maxLength",
    value = length,
    message = message or ("Maximum " .. length .. " characters allowed")
  }
end

return max_length
