-- Social feed module

---@class FeedModule
---@field post fun(author: string, content: string, timestamp: string): FeedPost
---@field list fun(posts: FeedPost[], layout?: string): FeedList
local feed = {
  post = require("feed.post"),
  list = require("feed.list")
}

return feed
