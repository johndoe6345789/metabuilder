--- Render the post composer component
---@return ComposerComponent Composer component
local function render_composer()
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

return render_composer
