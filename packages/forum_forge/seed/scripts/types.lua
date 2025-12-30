---@meta
-- Type definitions for forum_forge package

---@alias UserRole "public" | "user" | "moderator" | "admin" | "god" | "supergod"

---@class ForumUser
---@field id string User ID
---@field name string Username
---@field role UserRole User role level
---@field avatar? string Avatar URL

---@class ForumPost
---@field id string Post ID
---@field threadId string Parent thread ID
---@field authorId string Author user ID
---@field content string Post content
---@field createdAt number Created timestamp
---@field updatedAt? number Last update timestamp
---@field likes number Like count

---@class ForumThread
---@field id string Thread ID
---@field title string Thread title
---@field authorId string Author user ID
---@field forumId string Parent forum ID
---@field replyCount number Number of replies
---@field likeCount number Total likes
---@field lastReplyAt number Last reply timestamp
---@field createdAt number Created timestamp
---@field isPinned? boolean Whether thread is pinned
---@field isLocked? boolean Whether thread is locked

---@class FlagResult
---@field flagged boolean Whether post was flagged
---@field reasons string[] Reasons for flagging

---@class InstallContext
---@field version string Version number

---@class InstallResult
---@field message string Install message
---@field version string Version installed

---@class UninstallResult
---@field message string Uninstall message

---@class ForumForgeModule
---@field on_install fun(context: InstallContext): InstallResult
---@field on_uninstall fun(): UninstallResult
---@field flag_post fun(post: { content?: string }): FlagResult
---@field can_post fun(user: { role?: UserRole }): boolean
---@field can_moderate fun(user: { role?: UserRole }): boolean
---@field rank_thread fun(thread: ForumThread): number

return {}
