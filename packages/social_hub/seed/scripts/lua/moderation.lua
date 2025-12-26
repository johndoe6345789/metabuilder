local Moderation = {}

function Moderation.flag(content)
  local lowered = string.lower(content or "")
  if string.find(lowered, "spam") then
    return { flagged = true, reason = "spam_keyword" }
  end
  return { flagged = false }
end

return Moderation
