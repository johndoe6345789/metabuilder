-- admin_dialog: Confirmation Dialog Component
-- Standard confirmation dialog for admin actions

local M = {}

function M.render(context)
  local dialog = context.dialog or {
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning"
  }

  local variantClass = "admin_dialog_" .. (dialog.variant or "default")

  return {
    type = "div",
    className = "admin_dialog_overlay",
    children = {
      {
        type = "div",
        className = "card admin_dialog " .. variantClass,
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
            className = "admin_dialog_footer",
            children = {
              {
                type = "button",
                className = "button admin_dialog_button_cancel",
                text = dialog.cancelText,
                action = "admin.dialog.cancel"
              },
              {
                type = "button",
                className = "button admin_dialog_button_confirm",
                text = dialog.confirmText,
                action = "admin.dialog.confirm"
              }
            }
          }
        }
      }
    }
  }
end

return M
