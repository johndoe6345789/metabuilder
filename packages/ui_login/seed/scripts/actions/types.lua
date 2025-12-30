-- Type definitions for login actions module

---@class LoginForm
---@field username string User's username
---@field password string User's password

---@class RegisterForm
---@field username string User's username
---@field email string User's email address
---@field password string User's password

---@class ValidationError
---@field field string Field name with error
---@field message string Error message

---@class LoginSuccess
---@field success true Indicates success
---@field action "login" Action type
---@field username string Authenticated username

---@class RegisterSuccess
---@field success true Indicates success
---@field action "register" Action type
---@field username string Registered username
---@field email string Registered email

---@class ActionFailure
---@field success false Indicates failure
---@field errors ValidationError[] List of validation errors

return {}
