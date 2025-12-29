-- Post composer utilities
local M = {}

function M.render()
  return {
    type = "composer",
    children = {
      {
        type = "textarea",
        props = {
          placeholder = "What's on your mind?",
          name = "content",
          rows = 3
        }
      },
      {
        type = "composer_actions",
        children = {
          { type = "button", props = { icon = "image", label = "Media" } },
          { type = "button", props = { icon = "smile", label = "Emoji" } },
          { type = "button", props = { variant = "primary", label = "Post" } }
        }
      }
    }
  }
end

function M.validate(content)
  if not content or content == "" then
    return { valid = false, error = "Post cannot be empty" }
  end
  if #content > 500 then
    return { valid = false, error = "Post too long (max 500 chars)" }
  end
  return { valid = true }
end

function M.submit(content, media)
  return {
    action = "create_post",
    data = {
      content = content,
      media = media or {}
    }
  }
end

return M
