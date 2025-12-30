--- Calculate thread ranking score
--- Uses replies, likes, and recency
---@param thread ForumThread Thread to rank
---@return number Ranking score
local function rank_thread(thread)
  local replies = thread.replyCount or 0
  local likes = thread.likeCount or 0
  local recency = thread.lastReplyAt or thread.createdAt or 0

  return (replies * 2) + likes + (recency / 1000000)
end

return rank_thread
