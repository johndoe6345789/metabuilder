-- Example: Form fields with validation icons
local icons = require("icons")
local text_field = require("fields.text")
local email_field = require("fields.email")
local password_field = require("fields.password")
local required = require("validate.required")

---@class FormExample
local M = {}

---Create example login form with icons
---@return UIComponent
function M.create_login_form()
  return {
    type = "Box",
    props = { className = "max-w-md mx-auto p-6" },
    children = {
      {
        type = "Typography",
        props = { variant = "h4", text = "Login", className = "mb-6" }
      },
      {
        type = "Stack",
        props = { spacing = 3 },
        children = {
          -- Email field with icon
          {
            type = "Box",
            props = { className = "relative" },
            children = {
              {
                type = "Icon",
                props = {
                  name = icons.get("EMAIL"),
                  className = "absolute left-3 top-4 text-gray-400"
                }
              },
              {
                type = "TextField",
                props = {
                  label = "Email",
                  type = "email",
                  required = true,
                  className = "pl-10",
                  helperText = "Enter your email address"
                }
              }
            }
          },
          -- Password field with visibility toggle icon
          {
            type = "Box",
            props = { className = "relative" },
            children = {
              {
                type = "Icon",
                props = {
                  name = icons.get("LOCK"),
                  className = "absolute left-3 top-4 text-gray-400"
                }
              },
              {
                type = "TextField",
                props = {
                  label = "Password",
                  type = "password",
                  required = true,
                  className = "pl-10"
                }
              },
              {
                type = "IconButton",
                props = {
                  className = "absolute right-3 top-3",
                  onClick = "toggle_password_visibility"
                },
                children = {
                  { type = "Icon", props = { name = icons.get("VISIBILITY") } }
                }
              }
            }
          },
          -- Submit button
          {
            type = "Button",
            props = {
              variant = "contained",
              fullWidth = true,
              onClick = "submit_login"
            },
            children = {
              { type = "Icon", props = { name = icons.get("SIGN_IN"), className = "mr-2" } },
              { type = "Typography", props = { text = "Sign In" } }
            }
          }
        }
      }
    }
  }
end

---Create form with validation feedback icons
---@return UIComponent
function M.create_form_with_validation()
  return {
    type = "Stack",
    props = { spacing = 3 },
    children = {
      -- Success state
      {
        type = "Box",
        props = { className = "relative" },
        children = {
          {
            type = "TextField",
            props = {
              label = "Username",
              value = "johndoe",
              helperText = "Username is available"
            }
          },
          {
            type = "Icon",
            props = {
              name = icons.get("CHECK_CIRCLE"),
              className = "absolute right-3 top-4 text-green-500"
            }
          }
        }
      },
      -- Error state
      {
        type = "Box",
        props = { className = "relative" },
        children = {
          {
            type = "TextField",
            props = {
              label = "Email",
              value = "invalid-email",
              error = true,
              helperText = "Please enter a valid email address"
            }
          },
          {
            type = "Icon",
            props = {
              name = icons.get("ERROR"),
              className = "absolute right-3 top-4 text-red-500"
            }
          }
        }
      },
      -- Warning state
      {
        type = "Box",
        props = { className = "relative" },
        children = {
          {
            type = "TextField",
            props = {
              label = "Password",
              helperText = "Password strength: weak"
            }
          },
          {
            type = "Icon",
            props = {
              name = icons.get("WARNING_AMBER"),
              className = "absolute right-3 top-4 text-yellow-500"
            }
          }
        }
      }
    }
  }
end

return M
