--- Forum Forge package entry point
--- Provides forum functionality with moderation and permissions
---@class ForumForgePackage : ForumForgeModule
---@field name string Package name
---@field version string Package version
---@field moderation ModerationModule Moderation utilities
---@field permissions PermissionsModule Permission checking
---@field thread_rank ThreadRankModule Thread ranking

---@class ModerationModule
---@field flag_post fun(post: { content?: string }): FlagResult

---@class PermissionsModule
---@field can_post fun(user: { role?: UserRole }): boolean
---@field can_moderate fun(user: { role?: UserRole }): boolean

---@class ThreadRankModule
---@field rank_thread fun(thread: ForumThread): number

---@class InstallContext
---@field version string

---@class InstallResult
---@field message string
---@field version string

---@class UninstallResult
---@field message string

local M = {}

M.name = "forum_forge"
M.version = "1.0.0"

-- Load sub-modules
M.moderation = require("moderation")
M.permissions = require("permissions")
M.thread_rank = require("thread_rank")

-- Also expose functions directly
M.flag_post = require("flag_post")
M.can_post = require("can_post")
M.can_moderate = require("can_moderate")
M.rank_thread = require("rank_thread")

---@param context InstallContext
---@return InstallResult
function M.on_install(context)
  return { message = "Forum Forge installed", version = context.version }
end

---@return UninstallResult
function M.on_uninstall()
  return { message = "Forum Forge removed" }
end

return M
