-- Admin settings general section

---@class SettingsField
---@field id string The field identifier
---@field type string The field type (text, textarea, switch, etc.)
---@field label string The field label for display

---@class SettingsSection
---@field type string The section type identifier
---@field id string The section identifier
---@field title string The section title
---@field fields SettingsField[] Array of field configurations

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
