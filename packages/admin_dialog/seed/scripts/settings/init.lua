-- Admin settings module

---@class SettingsModule
---@field general function
---@field security function
local settings = {
  general = require("settings.general"),
  security = require("settings.security")
}

return settings
