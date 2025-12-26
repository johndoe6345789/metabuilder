local FeedRank = {}

function FeedRank.score(item)
  local freshness = item.age_minutes and (100 - item.age_minutes) or 50
  local engagement = (item.likes or 0) * 2 + (item.comments or 0) * 3
  return freshness + engagement
end

return FeedRank
