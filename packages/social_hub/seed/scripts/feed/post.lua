-- Social feed post component

---@class FeedPost
---@field type "post" Component type
---@field author string Post author
---@field content string Post content
---@field timestamp string Post timestamp
---@field actions string[] Available actions

---Create a social feed post component
---@param author string Post author name
---@param content string Post content text
---@param timestamp string Post timestamp
---@return FeedPost
local function post(author, content, timestamp)
  return {
    type = "post",
    author = author,
    content = content,
    timestamp = timestamp,
    actions = { "like", "comment", "share" }
  }
end

return post
