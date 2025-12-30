-- Render user profile card

require("profile.types")

local M = {}

---Renders the user profile card with form inputs
---@param ctx RenderContext
---@return UIComponent
function M.render(ctx)
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
            props = {
              ---@type InputProps
              label = "Username",
              value = ctx.user.username,
              disabled = true
            }
          },
          {
            type = "Input",
            props = {
              ---@type InputProps
              label = "Email",
              name = "email",
              value = ctx.user.email or ""
            }
          },
          {
            type = "Button",
            props = {
              ---@type ButtonProps
              text = "Save Changes",
              onClick = "saveProfile"
            }
          }
        }
      }
    }
  }
  return card
end

return M
