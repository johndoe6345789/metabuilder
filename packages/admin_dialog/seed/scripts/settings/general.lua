-- Admin settings general section

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
local function general_settings()
  return {
    type = "settings_section",
    id = "general",
    title = "General Settings",
    fields = {
      { id = "siteName", type = "text", label = "Site Name" },
      { id = "siteDescription", type = "textarea", label = "Description" },
      { id = "maintenance", type = "switch", label = "Maintenance Mode" }
    }
  }
end

return general_settings
