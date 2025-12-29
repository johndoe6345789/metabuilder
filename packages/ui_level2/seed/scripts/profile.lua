local M = {}

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

function M.saveProfile(form)
  return { success = true, action = "update_profile", email = form.email }
end

return M
