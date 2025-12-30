--- Submit a post action
---@param content string Post content
---@param media? string[] Media URLs
---@return SubmitAction Submit action
local function submit_post(content, media)
  return {
    action = "create_post",
    data = {
      content = content,
      media = media or {}
    }
  }
end

return submit_post
