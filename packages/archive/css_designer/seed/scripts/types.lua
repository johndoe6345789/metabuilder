-- LuaCATS type definitions for css_designer package
-- Provides types for visual CSS design and style export
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Color Types
--------------------------------------------------------------------------------

---@class ColorValue
---@field hex string Hex color value (e.g., "#1976d2")
---@field rgb? RGBColor RGB representation
---@field hsl? HSLColor HSL representation
---@field alpha? number Alpha/opacity (0-1)

---@class RGBColor
---@field r number Red (0-255)
---@field g number Green (0-255)
---@field b number Blue (0-255)

---@class HSLColor
---@field h number Hue (0-360)
---@field s number Saturation (0-100)
---@field l number Lightness (0-100)

---@class ColorPalette
---@field primary ColorValue Primary brand color
---@field secondary ColorValue Secondary brand color
---@field background ColorValue Background color
---@field surface ColorValue Surface/card color
---@field text_primary ColorValue Primary text color
---@field text_secondary ColorValue Secondary text color
---@field error ColorValue Error state color
---@field warning ColorValue Warning state color
---@field success ColorValue Success state color
---@field info ColorValue Info state color

--------------------------------------------------------------------------------
-- Typography Types
--------------------------------------------------------------------------------

---@class TypographyConfig
---@field fontFamily string Primary font family
---@field headingFont string Heading font family
---@field codeFont string Monospace/code font family
---@field baseFontSize number Base font size in pixels
---@field lineHeight? number Line height multiplier
---@field letterSpacing? number Letter spacing in em

---@class FontOption
---@field value string Font family value
---@field label string Display label
---@field category? "sans-serif"|"serif"|"monospace" Font category

--------------------------------------------------------------------------------
-- Spacing Types
--------------------------------------------------------------------------------

---@class SpacingConfig
---@field spacingUnit number Base spacing unit in pixels
---@field borderRadius number Default border radius in pixels
---@field containerWidth number Max container width in pixels

---@class SpacingScale
---@field xs number Extra small spacing
---@field sm number Small spacing
---@field md number Medium spacing
---@field lg number Large spacing
---@field xl number Extra large spacing

--------------------------------------------------------------------------------
-- Border Types
--------------------------------------------------------------------------------

---@class BorderConfig
---@field width number Border width in pixels
---@field color ColorValue Border color
---@field style "solid"|"dashed"|"dotted"|"none" Border style
---@field radius? number Border radius override

--------------------------------------------------------------------------------
-- Shadow Types
--------------------------------------------------------------------------------

---@class ShadowConfig
---@field blur number Blur radius in pixels
---@field spread number Spread radius in pixels
---@field opacity number Shadow opacity (0-100)
---@field offsetX? number Horizontal offset
---@field offsetY? number Vertical offset
---@field color? ColorValue Shadow color

---@class ShadowPreset
---@field name string Preset name
---@field config ShadowConfig Shadow configuration

--------------------------------------------------------------------------------
-- Theme Types
--------------------------------------------------------------------------------

---@class ThemeConfig
---@field name string Theme name
---@field colors ColorPalette Color palette
---@field typography TypographyConfig Typography settings
---@field spacing SpacingConfig Spacing settings
---@field borders BorderConfig Border defaults
---@field shadows ShadowConfig Shadow defaults

---@class ThemeExport
---@field scss string SCSS variable output
---@field css string CSS custom properties output
---@field json string JSON configuration output

--------------------------------------------------------------------------------
-- Component Types
--------------------------------------------------------------------------------

---@class DesignerState
---@field theme ThemeConfig Current theme configuration
---@field isDirty boolean Has unsaved changes
---@field previewMode "light"|"dark" Preview mode

---@class EditorProps
---@field value any Current value
---@field onChange fun(value: any): void Change handler
---@field label string Field label
---@field disabled? boolean Whether editor is disabled

-- Export types (no runtime exports)
return {}
