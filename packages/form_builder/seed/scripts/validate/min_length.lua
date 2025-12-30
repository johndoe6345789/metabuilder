-- Form validation min length rule

---@class ValidationRule
---@field type string
---@field pattern? string
---@field value? number | string
---@field message string

---@param length number
---@param message? string
---@return ValidationRule
local function min_length(length, message)
  return {
    type = "minLength",
    value = length,
    message = message or ("Minimum " .. length .. " characters required")
  }
end

return min_length
