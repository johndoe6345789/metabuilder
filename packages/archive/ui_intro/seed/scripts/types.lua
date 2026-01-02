-- LuaCATS type definitions for ui_intro package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Intro Props
--------------------------------------------------------------------------------

---@class IntroProps
---@field eyebrow? string Small text above title (e.g., "Level 2")
---@field title? string Main title text
---@field description? string Description paragraph
---@field variant? "default"|"centered"|"left" Layout variant
---@field className? string Additional CSS classes

---@class IntroSectionConfig
---@field showBorder? boolean Show bottom border
---@field spacing? "compact"|"normal"|"relaxed" Vertical spacing
---@field maxWidth? "sm"|"md"|"lg"|"xl" Max content width

--------------------------------------------------------------------------------
-- Typography Types
--------------------------------------------------------------------------------

---@alias TypographyVariant
---| "h1"
---| "h2"
---| "h3"
---| "h4"
---| "h5"
---| "h6"
---| "body1"
---| "body2"
---| "caption"
---| "overline"
---| "subtitle1"
---| "subtitle2"

---@class TypographyProps
---@field text string Text content
---@field variant? TypographyVariant Typography variant
---@field className? string CSS class name
---@field component? string HTML element to use

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

---@class StackProps
---@field direction? "row"|"column" Stack direction
---@field spacing? number Gap between items
---@field alignItems? string CSS align-items value
---@field justifyContent? string CSS justify-content value

--------------------------------------------------------------------------------
-- Intro Render Module
--------------------------------------------------------------------------------

---@class IntroRenderModule
---@field render fun(props: IntroProps): UIComponent Renders intro section

return {}
