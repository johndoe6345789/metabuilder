-- Theme Editor utilities

---@class ThemeEditor
local M = {}

---@class Theme
---@field primary? string
---@field secondary? string
---@field mode? string

---@class UIComponent
---@field type string
---@field props? table
---@field children? table

---@param theme? Theme
---@return UIComponent
function M.render(theme)
  return {
    type = "theme_editor",
    props = {
      primary = theme and theme.primary or "#1976d2",
      secondary = theme and theme.secondary or "#dc004e",
      mode = theme and theme.mode or "light"
    }
  }
end

---@param name string
---@param value string
---@return UIComponent
function M.color_picker(name, value)
  return {
    type = "color_picker",
    props = {
      name = name,
      value = value,
      show_alpha = false
    }
  }
end

---@return UIComponent
function M.mode_toggle()
  return {
    type = "switch",
    props = {
      label = "Dark Mode",
      name = "dark_mode"
    }
  }
end

return M
