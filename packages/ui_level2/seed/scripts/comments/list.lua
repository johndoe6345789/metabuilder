-- Comment list component
-- Single function module for comments UI

---@class CommentList
local M = {}

---Render list of comments
---@param comments Comment[] Array of comment objects
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

return M
