-- Admin settings module

---@class SettingsModule
---@field general function
---@field security function

---@type SettingsModule
local settings = {
  general = require("settings.general"),
  security = require("settings.security")
}

return settings
