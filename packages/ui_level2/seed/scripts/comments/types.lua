-- Type definitions for comments module
-- Shared across all comments functions

---@class Comment
---@field content string
---@field author string

---@class RenderContext
---@field comments? Comment[]

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class PostForm
---@field comment? string

---@class PostResult
---@field success boolean
---@field error? string
---@field action? string
---@field content? string

return {}
