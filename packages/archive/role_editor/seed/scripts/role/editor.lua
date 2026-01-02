-- Role editor component
require("role.types")
local role_module = require("role")
local role_card = require("role.card")

---@class RoleEditor
local M = {}

---Create the role editor component
---@param props RoleEditorProps
---@return UIComponent
function M.create(props)
  local roles = role_module.filterRoles(props.allowedRoles)

  -- Build select items
  local selectItems = {}
  for _, roleValue in ipairs(roles) do
    local info = role_module.getRoleInfo(roleValue)
    table.insert(selectItems, {
      type = "SelectItem",
      props = { value = roleValue },
      children = {
        {
          type = "Box",
          props = { className = "flex items-center justify-between gap-3" },
          children = {
            {
              type = "Text",
              props = { text = info.label }
            },
            {
              type = "Badge",
              props = {
                variant = info.variant,
                text = info.badge
              }
            }
          }
        }
      }
    })
  end

  -- Instance owner section (optional)
  local instanceOwnerSection = nil
  if props.showInstanceOwner then
    instanceOwnerSection = {
      type = "Box",
      props = { className = "flex items-center justify-between rounded-md border p-3" },
      children = {
        {
          type = "Box",
          children = {
            {
              type = "Text",
              props = { text = "Instance owner", className = "font-medium" }
            },
            {
              type = "Text",
              props = {
                text = "Grants access to backup, billing, and infrastructure settings.",
                className = "text-sm text-muted-foreground"
              }
            }
          }
        },
        {
          type = "Switch",
          props = {
            checked = props.isInstanceOwner or false,
            name = "instanceOwner"
          }
        }
      }
    }
  end

  return {
    type = "Card",
    children = {
      {
        type = "CardHeader",
        children = {
          {
            type = "CardTitle",
            props = { text = "User role" }
          },
          {
            type = "CardDescription",
            props = { text = "Adjust access level and ownership flags." }
          }
        }
      },
      {
        type = "CardContent",
        props = { className = "space-y-4" },
        children = {
          -- Role selector
          {
            type = "Box",
            props = { className = "space-y-2" },
            children = {
              {
                type = "Label",
                props = { text = "Role" }
              },
              {
                type = "Select",
                props = { value = props.role, name = "role" },
                children = {
                  {
                    type = "SelectTrigger",
                    props = { className = "w-full" },
                    children = {
                      {
                        type = "SelectValue",
                        props = { placeholder = "Choose a role" }
                      }
                    }
                  },
                  {
                    type = "SelectContent",
                    children = selectItems
                  }
                }
              }
            }
          },
          -- Role information card
          role_card.create(props.role),
          -- Instance owner toggle (if enabled)
          instanceOwnerSection
        }
      }
    }
  }
end

return M
