-- Admin settings security section

---@class SettingsField
---@field id string The field identifier
---@field type string The field type (switch, number, etc.)
---@field label string The field label for display

---@class SettingsSection
---@field type string The section type identifier
---@field id string The section identifier
---@field title string The section title
---@field fields SettingsField[] Array of field configurations

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
