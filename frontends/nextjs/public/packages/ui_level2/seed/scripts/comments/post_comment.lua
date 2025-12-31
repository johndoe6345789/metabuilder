-- Post comment handler
-- Single function module for comments UI

require("comments.types")

---@class PostComment
local M = {}

---Handle posting a comment
---@param form PostForm Form data with comment field
---@return PostResult Result with success status
function M.postComment(form)
  if not form.comment or form.comment == "" then
    return { success = false, error = "Comment required" }
  end
  return { success = true, action = "post_comment", content = form.comment }
end

return M
