-- Comment composer component
-- Single function module for comments UI

require("comments.types")

---@class Composer
local M = {}

---Render comment composer form
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

return M
