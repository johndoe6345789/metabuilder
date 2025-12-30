-- Admin settings security section
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
