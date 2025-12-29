-- Example: Simple Form UI Package
-- This demonstrates how UI can be defined in Lua instead of TypeScript/React

return {
  metadata = {
    id = "example-form",
    version = "1.0.0",
    name = "Example Form Package",
    description = "A simple form demonstrating Lua UI definition",
    author = "MetaBuilder",
    category = "ui"
  },

  pages = {
    {
      id = "page_example_form",
      path = "/example-form",
      title = "Example Form",
      level = 2,
      requiresAuth = false,

      layout = {
        type = "Stack",
        props = {
          spacing = 3,
          padding = 4
        },

        children = {
          -- Header
          {
            type = "Typography",
            props = {
              variant = "h4",
              text = "Example Form"
            }
          },

          -- Form
          {
            type = "Form",
            props = {
              id = "example_form",
              onSubmit = "handleFormSubmit"
            },

            children = {
              -- Name Field
              {
                type = "Input",
                props = {
                  name = "name",
                  label = "Your Name",
                  required = true,
                  placeholder = "Enter your name"
                }
              },

              -- Email Field
              {
                type = "Input",
                props = {
                  name = "email",
                  label = "Email Address",
                  type = "email",
                  required = true,
                  validation = {
                    pattern = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
                    message = "Please enter a valid email"
                  }
                }
              },

              -- Message Field
              {
                type = "TextArea",
                props = {
                  name = "message",
                  label = "Message",
                  rows = 4,
                  placeholder = "Enter your message"
                }
              },

              -- Submit Button
              {
                type = "Button",
                props = {
                  type = "submit",
                  variant = "contained",
                  color = "primary",
                  text = "Submit"
                }
              }
            }
          }
        }
      }
    }
  },

  actions = {
    handleFormSubmit = function(formData)
      -- This Lua function handles form submission
      print("Form submitted with data:")
      for key, value in pairs(formData) do
        print(string.format("  %s = %s", key, value))
      end

      -- Return success response
      return {
        success = true,
        message = "Form submitted successfully!"
      }
    end
  },

  validation = {
    name = {
      type = "string",
      minLength = 2,
      maxLength = 100,
      required = true
    },
    email = {
      type = "string",
      format = "email",
      required = true
    },
    message = {
      type = "string",
      maxLength = 500
    }
  }
}
