-- SMTP configuration editor component
require("smtp.types")
local smtp = require("smtp")

---@class SMTPEditor
local M = {}

---Create form field based on field definition
---@param field SMTPField
---@param value any
---@return UIComponent
local function createField(field, value)
  if field.type == "boolean" then
    return {
      type = "Box",
      props = { className = "flex items-center gap-3" },
      children = {
        {
          type = "Switch",
          props = {
            id = field.name,
            checked = value or false,
            name = field.name
          }
        },
        {
          type = "Label",
          props = {
            htmlFor = field.name,
            text = field.label,
            className = "cursor-pointer"
          }
        }
      }
    }
  else
    return {
      type = "Box",
      props = { className = "space-y-1.5" },
      children = {
        {
          type = "Label",
          props = { htmlFor = field.name, text = field.label }
        },
        {
          type = "Input",
          props = {
            id = field.name,
            name = field.name,
            type = field.type,
            value = value or "",
            placeholder = field.placeholder
          }
        }
      }
    }
  end
end

---Create the SMTP config editor component
---@param props SMTPEditorProps
---@return UIComponent
function M.create(props)
  local config = props.config or smtp.createDefault()
  local fields = smtp.getFields()

  -- Build form fields (skip boolean fields for grid layout)
  local gridFields = {}
  local booleanFields = {}

  for _, field in ipairs(fields) do
    local value = config[field.name]
    local fieldComponent = createField(field, value)

    if field.type == "boolean" then
      table.insert(booleanFields, fieldComponent)
    else
      table.insert(gridFields, fieldComponent)
    end
  end

  return {
    type = "Box",
    props = { className = "space-y-6" },
    children = {
      -- Main config card
      {
        type = "Card",
        children = {
          {
            type = "CardHeader",
            children = {
              {
                type = "CardTitle",
                props = {
                  text = "SMTP Configuration",
                  className = "flex items-center gap-2"
                }
              },
              {
                type = "CardDescription",
                props = {
                  text = "Configure SMTP settings for password reset and system emails"
                }
              }
            }
          },
          {
            type = "CardContent",
            props = { className = "space-y-6" },
            children = {
              -- Grid of fields
              {
                type = "Box",
                props = { className = "grid grid-cols-1 md:grid-cols-2 gap-4" },
                children = gridFields
              },
              -- Boolean fields
              unpack(booleanFields),
              -- Save button
              {
                type = "Box",
                props = { className = "flex items-center gap-3 pt-4 border-t border-border" },
                children = {
                  {
                    type = "Button",
                    props = {
                      type = "submit",
                      text = "Save Configuration",
                      className = "gap-2"
                    }
                  }
                }
              }
            }
          }
        }
      },
      -- Test email card
      {
        type = "Card",
        children = {
          {
            type = "CardHeader",
            children = {
              {
                type = "CardTitle",
                props = { text = "Test Email" }
              },
              {
                type = "CardDescription",
                props = {
                  text = "Send a test email to verify your SMTP configuration (simulated)"
                }
              }
            }
          },
          {
            type = "CardContent",
            children = {
              {
                type = "Box",
                props = { className = "flex gap-3" },
                children = {
                  {
                    type = "Input",
                    props = {
                      type = "email",
                      placeholder = "test@example.com",
                      value = props.testEmail or "",
                      name = "testEmail",
                      className = "flex-1"
                    }
                  },
                  {
                    type = "Button",
                    props = {
                      text = "Send Test",
                      className = "gap-2"
                    }
                  }
                }
              },
              {
                type = "Text",
                props = {
                  text = "Note: Email functionality is simulated. Check browser console for email details.",
                  className = "text-sm text-muted-foreground mt-3"
                }
              }
            }
          }
        }
      }
    }
  }
end

return M
