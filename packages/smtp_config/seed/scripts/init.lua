--- SMTP Config Package
--- Provides configurable SMTP configuration UI components
---@module init

---@class SMTPConfigModule
---@field smtp table SMTP configuration functions
---@field validate table Validation utilities
return {
  smtp = require("smtp"),
  validate = require("validate")
}
