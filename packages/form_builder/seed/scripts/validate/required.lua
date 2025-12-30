-- Form validation required rule

---@class ValidationRule
---@field type string
---@field pattern? string
---@field value? number | string
---@field message string
---@field icon? string Icon name from fakemui icons for validation feedback

---@param message? string
---@return ValidationRule
local function required(message)
  return {
    type = "required",
    message = message or "This field is required"
  }
end

return required
