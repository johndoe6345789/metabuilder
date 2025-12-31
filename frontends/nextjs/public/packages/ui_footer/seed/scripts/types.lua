-- LuaCATS type definitions for ui_footer package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Footer Props
--------------------------------------------------------------------------------

---@class FooterProps
---@field text? string Custom footer text
---@field showCopyright? boolean Whether to show copyright symbol
---@field year? string|number Year for copyright
---@field links? FooterLink[] Optional footer links

---@class FooterLink
---@field label string Link text
---@field href string Link URL
---@field external? boolean Opens in new tab if true

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

---@class TypographyProps
---@field text string Text content
---@field variant? "body1"|"body2"|"caption"|"overline" Typography variant
---@field className? string CSS class name

---@class BoxProps
---@field className? string CSS class name
---@field sx? table<string, any> Style object

---@class ContainerProps
---@field className? string CSS class name
---@field maxWidth? "xs"|"sm"|"md"|"lg"|"xl" Max container width

--------------------------------------------------------------------------------
-- Footer Render Module
--------------------------------------------------------------------------------

---@class FooterRenderModule
---@field render fun(props: FooterProps): UIComponent Renders footer component

return {}
