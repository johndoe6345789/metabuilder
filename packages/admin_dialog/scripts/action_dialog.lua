-- admin_dialog: Action Dialog Component
-- Multi-purpose dialog for admin actions with custom buttons

local M = {}

function M.render(context)
  local dialog = context.dialog or {
    title = "Admin Action",
    message = "Select an action to perform",
    actions = {
      { text = "Approve", action = "admin.action.approve", variant = "primary" },
      { text = "Reject", action = "admin.action.reject", variant = "danger" },
      { text = "Review Later", action = "admin.action.defer", variant = "secondary" }
    }
  }

  local actionButtons = {}
  for _, actionDef in ipairs(dialog.actions) do
    local buttonClass = "button admin_dialog_button_" .. (actionDef.variant or "default")
    table.insert(actionButtons, {
      type = "button",
      className = buttonClass,
      text = actionDef.text,
      action = actionDef.action,
      data = actionDef.data
    })
  end

  return {
    type = "div",
    className = "admin_dialog_overlay",
    children = {
      {
        type = "div",
        className = "card admin_dialog",
        children = {
          {
            type = "div",
            className = "admin_dialog_header",
            children = {
              {
                type = "h3",
                className = "admin_dialog_title",
                text = dialog.title
              }
            }
          },
          {
            type = "div",
            className = "admin_dialog_body",
            children = {
              {
                type = "p",
                className = "admin_dialog_message",
                text = dialog.message
              }
            }
          },
          {
            type = "div",
            className = "admin_dialog_footer admin_dialog_footer_multi",
            children = actionButtons
          }
        }
      }
    }
  }
end

return M
