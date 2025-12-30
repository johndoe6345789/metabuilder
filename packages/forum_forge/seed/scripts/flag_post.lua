--- Flag a post for moderation
--- Checks content length and banned terms
---@param post { content?: string } Post to check
---@return FlagResult Flagging result
local function flag_post(post)
  local banned_terms = {
    "spam",
    "scam",
    "phish",
    "abuse"
  }

  local content = post.content or ""
  local reasons = {}

  if #content > 5000 then
    table.insert(reasons, "Post exceeds 5000 characters")
  end

  local lowered = string.lower(content)
  for _, term in ipairs(banned_terms) do
    if string.find(lowered, term, 1, true) then
      table.insert(reasons, "Contains banned term: " .. term)
    end
  end

  return {
    flagged = #reasons > 0,
    reasons = reasons
  }
end

return flag_post
