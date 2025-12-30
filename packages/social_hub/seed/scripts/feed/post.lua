-- Social feed post component
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
