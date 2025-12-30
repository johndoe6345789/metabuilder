-- Render user profile card

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class InputProps
---@field label string
---@field value string
---@field name? string
---@field disabled? boolean

---@class ButtonProps
---@field text string
---@field onClick string

---@class UserInfo
---@field username string
---@field email? string

---@class RenderContext
---@field user UserInfo

local M = {}

---Renders the user profile card with form inputs
---@param ctx RenderContext
---@return UIComponent
function M.render(ctx)
  return {
    type = "Card",
    children = {
      {
        type = "CardHeader",
        children = {
          { type = "CardTitle", props = { text = "Your Profile" } }
        }
      },
      {
        type = "CardContent",
        children = {
          {
            type = "Input",
            props = {
              label = "Username",
              value = ctx.user.username,
              disabled = true
            }
          },
          {
            type = "Input",
            props = {
              label = "Email",
              name = "email",
              value = ctx.user.email or ""
            }
          },
          {
            type = "Button",
            props = {
              text = "Save Changes",
              onClick = "saveProfile"
            }
          }
        }
      }
    }
  }
end

return M
