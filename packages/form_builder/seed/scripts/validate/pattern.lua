-- Form validation pattern rule

---@class ValidationRule
---@field type string
---@field pattern? string
---@field value? number | string
---@field message string

---@param regex string
---@param message? string
---@return ValidationRule
local function pattern(regex, message)
  return {
    type = "pattern",
    value = regex,
    message = message or "Invalid format"
  }
end

return pattern
