--- Social Hub package entry point
--- Provides social media feed and interaction components
---@class SocialHub
---@field feed SocialFeedModule Feed module
---@field composer SocialComposerModule Composer module
---@field stats SocialStatsModule Stats module
---@field name string Package name
---@field version string Package version
---@field init fun(): { name: string, version: string, loaded: boolean }

---@class SocialFeedModule
---@field render_post fun(post: Post): PostComponent
---@field render_feed fun(posts: Post[]): FeedComponent
---@field empty_state fun(): EmptyStateComponent

---@class SocialComposerModule
---@field render fun(): ComposerComponent
---@field validate fun(content?: string): ValidationResult
---@field submit fun(content: string, media?: string[]): SubmitAction

---@class SocialStatsModule
---@field render_stat fun(label: string, value: number, icon: string): StatCardComponent
---@field render_stats fun(data: { followers?: number, following?: number, posts?: number }): StatsGridComponent
---@field render_hero fun(user: User): HeroSectionComponent

local M = {}

M.name = "social_hub"
M.version = "1.0.0"

M.feed = require("feed")
M.composer = require("composer")
M.stats = require("stats")

--- Initialize the social hub module
---@return { name: string, version: string, loaded: boolean }
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
