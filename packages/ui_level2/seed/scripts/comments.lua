local M = {}

function M.render(ctx)
  return {
    type = "Stack",
    props = { spacing = 4 },
    children = {
      M.composer(),
      M.list(ctx.comments or {})
    }
  }
end

function M.composer()
  return {
    type = "Card",
    children = {
      { type = "CardContent", children = {
        { type = "TextArea", props = { name = "comment", placeholder = "Write a comment..." } },
        { type = "Button", props = { text = "Post", onClick = "postComment" } }
      }}
    }
  }
end

function M.list(comments)
  local items = {}
  for _, c in ipairs(comments) do
    items[#items + 1] = {
      type = "Card",
      children = {
        { type = "CardContent", children = {
          { type = "Typography", props = { text = c.content } },
          { type = "Typography", props = { variant = "caption", text = c.author } }
        }}
      }
    }
  end
  return { type = "Stack", props = { spacing = 2 }, children = items }
end

function M.postComment(form)
  if not form.comment or form.comment == "" then
    return { success = false, error = "Comment required" }
  end
  return { success = true, action = "post_comment", content = form.comment }
end

return M
