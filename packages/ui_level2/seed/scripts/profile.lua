-- Profile component module

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class RenderContext
---@field user table
---@field user.username string
---@field user.email? string

---@class FormData
---@field email string

---@class ProfileResponse
---@field success boolean
---@field action string
---@field email string

---@type table
local M = {}

---Renders the user profile card with form inputs
---@param ctx RenderContext
---@return UIComponent
function M.render(ctx)
  return {
    type = "Card",
    children = {
      { type = "CardHeader", children = { { type = "CardTitle", props = { text = "Your Profile" } } } },
      {
        type = "CardContent",
        children = {
          { type = "Input", props = { label = "Username", value = ctx.user.username, disabled = true } },
          { type = "Input", props = { label = "Email", name = "email", value = ctx.user.email or "" } },
          { type = "Button", props = { text = "Save Changes", onClick = "saveProfile" } }
        }
      }
    }
  }
end

---Processes profile form submission and returns response
---@param form FormData
---@return ProfileResponse
function M.saveProfile(form)
  return { success = true, action = "update_profile", email = form.email }
end

return M
