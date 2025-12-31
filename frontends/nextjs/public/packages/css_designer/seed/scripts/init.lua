-- CSS Designer initialization
-- Main entry point for the css_designer package

---@class CSSDesigner
---@field name string Package name
---@field version string Package version
local M = {}

M.name = "css_designer"
M.version = "1.0.0"

---@class InitResult
---@field name string Package name
---@field version string Package version
---@field loaded boolean Whether successfully loaded

---Initialize the CSS designer module
---@return InitResult
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

---Get default theme configuration
---@return ThemeConfig
function M.get_default_theme()
  return {
    name = "Default",
    colors = {
      primary = { hex = "#1976d2" },
      secondary = { hex = "#9c27b0" },
      background = { hex = "#ffffff" },
      surface = { hex = "#f5f5f5" },
      text_primary = { hex = "#212121" },
      text_secondary = { hex = "#757575" },
      error = { hex = "#f44336" },
      warning = { hex = "#ff9800" },
      success = { hex = "#4caf50" },
      info = { hex = "#2196f3" }
    },
    typography = {
      fontFamily = "IBM Plex Sans",
      headingFont = "Space Grotesk",
      codeFont = "JetBrains Mono",
      baseFontSize = 16
    },
    spacing = {
      spacingUnit = 8,
      borderRadius = 4,
      containerWidth = 1200
    },
    borders = {
      width = 1,
      color = { hex = "#e0e0e0" },
      style = "solid"
    },
    shadows = {
      blur = 4,
      spread = 0,
      opacity = 15
    }
  }
end

return M
