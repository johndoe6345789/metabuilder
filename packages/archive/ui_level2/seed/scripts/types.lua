-- LuaCATS type definitions for ui_level2 package (User Dashboard)
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Render Context
--------------------------------------------------------------------------------

---@class RenderContext
---@field user User Current logged-in user
---@field settings? UserSettings User preferences

---@class User
---@field id string User ID
---@field username string Username
---@field email? string Email address
---@field level number Permission level (2 = USER)
---@field avatarUrl? string Avatar URL
---@field createdAt? string ISO date string

---@class UserSettings
---@field theme? "light"|"dark"|"system" Color theme
---@field notifications? boolean Enable notifications
---@field language? string UI language code

--------------------------------------------------------------------------------
-- Profile Types
--------------------------------------------------------------------------------

---@class ProfileData
---@field displayName? string Display name
---@field bio? string User biography
---@field location? string User location
---@field website? string Personal website URL
---@field socialLinks? SocialLink[]

---@class SocialLink
---@field platform string Platform name (twitter, github, etc.)
---@field url string Profile URL

---@class ProfileUpdateResult
---@field success boolean Whether update succeeded
---@field errors? table<string, string> Field-level errors

--------------------------------------------------------------------------------
-- Comments Types
--------------------------------------------------------------------------------

---@class Comment
---@field id string Comment ID
---@field text string Comment text
---@field authorId string Author user ID
---@field authorName string Author username
---@field createdAt string ISO date string
---@field parentId? string Parent comment ID (for replies)
---@field likes number Like count

---@class CommentFormData
---@field text string Comment text
---@field parentId? string Parent comment ID

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

---@class TabsProps
---@field defaultValue string Default active tab
---@field value? string Controlled tab value
---@field onValueChange? string Callback name

---@class TabsTriggerProps
---@field value string Tab identifier
---@field text string Tab label
---@field disabled? boolean Disable tab

--------------------------------------------------------------------------------
-- Layout Module
--------------------------------------------------------------------------------

---@class LayoutModule
---@field render fun(ctx: RenderContext): UIComponent Main layout renderer
---@field tabs fun(): UIComponent Tab navigation component

---@class ProfileModule
---@field render fun(user: User): UIComponent Profile tab content
---@field update fun(data: ProfileData): ProfileUpdateResult Update profile

---@class CommentsModule
---@field render fun(comments: Comment[]): UIComponent Comments list
---@field post fun(data: CommentFormData): Comment Post new comment

return {}
