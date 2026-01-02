-- LuaCATS type definitions for ui_home package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Navigation Types
--------------------------------------------------------------------------------

---@class NavigationRoute
---@field path string Route path
---@field level number Required permission level
---@field label? string Display label
---@field icon? string Icon name

---@class NavigationResult
---@field success boolean Whether navigation was successful
---@field route? NavigationRoute Target route info
---@field error? string Error message if failed

---@class NavigationOptions
---@field replace? boolean Replace current history entry
---@field state? table<string, any> State to pass to destination

--------------------------------------------------------------------------------
-- Home Page Props
--------------------------------------------------------------------------------

---@class HomePageProps
---@field user? User Current user (nil if public)
---@field features? FeatureCard[] Features to display
---@field showHero? boolean Show hero section

---@class FeatureCard
---@field id string Feature identifier
---@field title string Feature title
---@field description string Feature description
---@field icon string Icon name
---@field href? string Link destination
---@field level? number Required level to see

---@class HeroProps
---@field title string Hero title
---@field subtitle? string Hero subtitle
---@field ctaText? string Call-to-action button text
---@field ctaHref? string Call-to-action link

--------------------------------------------------------------------------------
-- User Types
--------------------------------------------------------------------------------

---@class User
---@field id string User ID
---@field username string Username
---@field level number Permission level (1-6)

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

--------------------------------------------------------------------------------
-- Navigation Module
--------------------------------------------------------------------------------

---@class NavigateModule
---@field to fun(path: string, options?: NavigationOptions): NavigationResult Navigate to path
---@field back fun(): NavigationResult Go back in history
---@field forward fun(): NavigationResult Go forward in history
---@field canAccess fun(route: NavigationRoute, user?: User): boolean Check if user can access route

return {}
