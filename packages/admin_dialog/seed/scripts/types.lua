-- Type definitions for admin_dialog package
-- Central types file re-exporting all module types
-- @meta

-- Re-export user types
local user_types = require("user.types")

---@alias PermissionLevel 0|1|2|3|4|5|6

---@class AdminSettings
---@field siteName string Site name for the application
---@field siteDescription string Site description
---@field maintenanceMode boolean Whether site is in maintenance mode
---@field allowRegistration boolean Whether new user registration is allowed
---@field requireEmailVerification boolean Whether email verification is required
---@field defaultUserLevel PermissionLevel Default level for new users
---@field sessionTimeout number Session timeout in minutes
---@field maxLoginAttempts number Maximum login attempts before lockout
---@field lockoutDuration number Lockout duration in minutes

---@class SecuritySettings
---@field enforceHttps boolean Force HTTPS connections
---@field csrfProtection boolean Enable CSRF protection
---@field rateLimiting boolean Enable rate limiting
---@field maxRequestsPerMinute number Maximum requests per minute
---@field allowedOrigins string[] List of allowed CORS origins
---@field twoFactorRequired boolean Require 2FA for admin users
---@field passwordMinLength number Minimum password length
---@field passwordRequireSpecial boolean Require special characters in password
---@field passwordRequireNumber boolean Require numbers in password
---@field passwordRequireUppercase boolean Require uppercase in password

---@class GeneralSettings
---@field theme "light"|"dark"|"system" Theme setting
---@field language string Language code (e.g., "en", "es", "fr")
---@field timezone string Timezone identifier
---@field dateFormat string Date format string
---@field timeFormat string Time format string

---@class SettingsDialogProps
---@field currentSettings AdminSettings Current settings values
---@field onSave fun(settings: AdminSettings): void Save callback
---@field onCancel fun(): void Cancel callback
---@field userLevel PermissionLevel Current user's permission level

---@class UserDialogProps
---@field user User|nil User to edit (nil for create)
---@field mode "create"|"edit" Dialog mode
---@field onSave fun(user: User): void Save callback
---@field onCancel fun(): void Cancel callback
---@field availableRoles string[] Available role options

---@class DialogResult
---@field success boolean Whether operation succeeded
---@field message string|nil Result message
---@field data table|nil Result data

---@class InitResult
---@field name string Package name
---@field version string Package version
---@field loaded boolean Whether successfully loaded

-- Export all types (no runtime exports, types only)
return {}
