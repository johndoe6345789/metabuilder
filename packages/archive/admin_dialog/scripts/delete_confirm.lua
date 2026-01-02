-- admin_dialog: Delete Confirmation Dialog Component
-- Specialized dialog for destructive delete actions

local M = {}

function M.render(context)
  local item = context.item or {
    type = "item",
    name = "Unknown Item"
  }

  return {
    type = "div",
    className = "admin_dialog_overlay",
    children = {
      {
        type = "div",
        className = "card admin_dialog admin_dialog_danger",
        children = {
          {
            type = "div",
            className = "admin_dialog_header",
            children = {
              {
                type = "h3",
                className = "admin_dialog_title",
                text = "⚠️ Confirm Delete"
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
                text = "You are about to permanently delete:"
              },
              {
                type = "div",
                className = "admin_dialog_item_info",
                children = {
                  {
                    type = "strong",
                    text = item.name
                  },
                  {
                    type = "p",
                    className = "admin_dialog_warning",
                    text = "This action cannot be undone!"
                  }
                }
              },
              {
                type = "input",
                className = "input admin_dialog_confirm_input",
                name = "confirmText",
                placeholder = "Type 'DELETE' to confirm",
                required = true
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
                text = "Cancel",
                action = "admin.dialog.cancel"
              },
              {
                type = "button",
                className = "button admin_dialog_button_danger",
                text = "Delete Permanently",
                action = "admin.dialog.delete",
                data = { itemId = item.id, itemType = item.type }
              }
            }
          }
        }
      }
    }
  }
end

return M
