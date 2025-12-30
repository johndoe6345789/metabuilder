-- Admin settings security section

---@class SettingsSection
---@field type string
---@field id string
---@field title string
---@field fields SettingsField[]

---@class SettingsField
---@field id string
---@field type string
---@field label string

---@return SettingsSection
local function security_settings()
  return {
    type = "settings_section",
    id = "security",
    title = "Security Settings",
    fields = {
      { id = "twoFactor", type = "switch", label = "Require 2FA" },
      { id = "sessionTimeout", type = "number", label = "Session Timeout (min)" },
      { id = "maxLoginAttempts", type = "number", label = "Max Login Attempts" }
    }
  }
end

return security_settings
