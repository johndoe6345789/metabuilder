-- Example: Data table with icon-based actions
local icons = require("icons")
local action_column = require("columns.action")
local text_column = require("columns.text")

---@class DataTableExample
local M = {}

---Create example user table with icons
---@return table
function M.create_user_table()
  local columns = {
    text_column("name", "Name"),
    text_column("email", "Email"),
    text_column("role", "Role"),
    text_column("status", "Status"),
    action_column("actions", {
      {
        id = "view",
        icon = icons.get("EYE"),
        label = "View",
        handler = "view_user"
      },
      {
        id = "edit",
        icon = icons.get("EDIT"),
        label = "Edit",
        handler = "edit_user"
      },
      {
        id = "delete",
        icon = icons.get("TRASH"),
        label = "Delete",
        handler = "delete_user",
        confirm = true
      }
    })
  }

  local data = {
    { name = "John Doe", email = "john@example.com", role = "Admin", status = "Active" },
    { name = "Jane Smith", email = "jane@example.com", role = "User", status = "Active" },
    { name = "Bob Wilson", email = "bob@example.com", role = "User", status = "Inactive" }
  }

  return {
    columns = columns,
    data = data
  }
end

---Create example table with export options
---@return UIComponent
function M.create_table_with_export()
  return {
    type = "Box",
    props = { className = "p-6" },
    children = {
      {
        type = "Stack",
        props = { direction = "row", spacing = 2, className = "mb-4" },
        children = {
          {
            type = "Button",
            props = {
              variant = "outlined",
              onClick = "export_csv"
            },
            children = {
              { type = "Icon", props = { name = icons.get("CSV"), className = "mr-2" } },
              { type = "Typography", props = { text = "Export CSV" } }
            }
          },
          {
            type = "Button",
            props = {
              variant = "outlined",
              onClick = "export_json"
            },
            children = {
              { type = "Icon", props = { name = icons.get("JSON"), className = "mr-2" } },
              { type = "Typography", props = { text = "Export JSON" } }
            }
          },
          {
            type = "Button",
            props = {
              variant = "outlined",
              onClick = "refresh_data"
            },
            children = {
              { type = "Icon", props = { name = icons.get("REFRESH"), className = "mr-2" } },
              { type = "Typography", props = { text = "Refresh" } }
            }
          }
        }
      }
      -- Table would be added here
    }
  }
end

return M
