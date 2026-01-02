-- Font selector utility functions
-- Provides font options and formatting

---@class FontSelector
local M = {}

---@type FontOption[]
local FONT_OPTIONS = {
  -- Sans-serif fonts
  { value = "IBM Plex Sans", label = "IBM Plex Sans", category = "sans-serif" },
  { value = "Inter", label = "Inter", category = "sans-serif" },
  { value = "Roboto", label = "Roboto", category = "sans-serif" },
  { value = "Open Sans", label = "Open Sans", category = "sans-serif" },
  { value = "Lato", label = "Lato", category = "sans-serif" },
  { value = "system-ui", label = "System UI", category = "sans-serif" },
  
  -- Heading fonts
  { value = "Space Grotesk", label = "Space Grotesk", category = "sans-serif" },
  { value = "Poppins", label = "Poppins", category = "sans-serif" },
  { value = "Montserrat", label = "Montserrat", category = "sans-serif" },
  
  -- Monospace fonts
  { value = "JetBrains Mono", label = "JetBrains Mono", category = "monospace" },
  { value = "Fira Code", label = "Fira Code", category = "monospace" },
  { value = "Source Code Pro", label = "Source Code Pro", category = "monospace" },
  { value = "Monaco", label = "Monaco", category = "monospace" },
  
  -- Serif fonts
  { value = "Georgia", label = "Georgia", category = "serif" },
  { value = "Merriweather", label = "Merriweather", category = "serif" },
  { value = "Playfair Display", label = "Playfair Display", category = "serif" }
}

---Get all available font options
---@param category? "sans-serif"|"serif"|"monospace" Filter by category
---@return FontOption[] options Array of font options
function M.get_font_options(category)
  if not category then
    return FONT_OPTIONS
  end
  
  local filtered = {}
  for _, font in ipairs(FONT_OPTIONS) do
    if font.category == category then
      table.insert(filtered, font)
    end
  end
  return filtered
end

---Get the category for a font
---@param fontFamily string Font family name
---@return string|nil category Font category or nil if unknown
function M.get_font_category(fontFamily)
  for _, font in ipairs(FONT_OPTIONS) do
    if font.value == fontFamily then
      return font.category
    end
  end
  return nil
end

---Format a font family for CSS
---@param fontFamily string Primary font family
---@param fallback? string Fallback category (defaults to category of font)
---@return string formatted CSS font-family value
function M.format_font_family(fontFamily, fallback)
  local category = fallback or M.get_font_category(fontFamily) or "sans-serif"
  return "'" .. fontFamily .. "', " .. category
end

return M
