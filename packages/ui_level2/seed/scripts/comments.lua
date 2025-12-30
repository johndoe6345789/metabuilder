---@class Comments
local M = {}

---@class Comment
---@field content string
---@field author string

---@class RenderContext
---@field comments? Comment[]

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class PostForm
---@field comment? string

---@class PostResult
---@field success boolean
---@field error? string
---@field action? string
---@field content? string

---@param ctx RenderContext
---@return UIComponent
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

---@return UIComponent
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

---@param comments Comment[]
---@return UIComponent
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

---@param form PostForm
---@return PostResult
function M.postComment(form)
  if not form.comment or form.comment == "" then
    return { success = false, error = "Comment required" }
  end
  return { success = true, action = "post_comment", content = form.comment }
end

return M
