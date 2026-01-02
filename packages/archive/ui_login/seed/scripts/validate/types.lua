-- Type definitions for validation module

---@class ValidationError
---@field field string Field name with error
---@field message string Error message description

---@class ValidationResult
---@field valid boolean Whether validation passed
---@field errors ValidationError[] List of errors (empty if valid)

---@class LoginData
---@field username string? Username to validate
---@field password string? Password to validate

---@class RegisterData
---@field username string? Username to validate
---@field email string? Email to validate
---@field password string? Password to validate

return {}
