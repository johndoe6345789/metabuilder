-- Render user profile card

require("profile.types")

local M = {}

---Renders the user profile card with form inputs
---@param ctx RenderContext
---@return UIComponent
function M.render(ctx)
  ---@type InputProps
  local usernameProps = {
    label = "Username",
    value = ctx.user.username,
    disabled = true
  }
  ---@type InputProps
  local emailProps = {
    label = "Email",
    name = "email",
    value = ctx.user.email or ""
  }
  ---@type ButtonProps
  local saveProps = {
    text = "Save Changes",
    onClick = "saveProfile"
  }
  ---@type UIComponent
  local card = {
    type = "Card",
    children = {
      {
        type = "CardHeader",
        children = {
          {
            type = "Icon",
            props = {
              ---@type IconProps
              name = "IdCard",
              size = "large"
            }
          },
          { type = "CardTitle", props = { text = "Your Profile" } }
        }
      },
      {
        type = "CardContent",
        children = {
          {
            type = "Input",
            props = usernameProps
          },
          {
            type = "Input",
            props = emailProps
          },
          {
            type = "Button",
            props = saveProps
          }
        }
      }
    }
  }
  return card
end

return M
