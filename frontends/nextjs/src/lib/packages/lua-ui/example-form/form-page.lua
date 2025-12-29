local M = {}

function M.render()
  return {
    type = "Stack",
    props = { spacing = 3, padding = 4 },
    children = {
      {
        type = "Typography",
        props = { variant = "h4", text = "Example Form" }
      },
      {
        type = "Form",
        props = { id = "example_form", onSubmit = "handleFormSubmit" },
        children = {
          {
            type = "Input",
            props = { name = "name", label = "Your Name", required = true }
          },
          {
            type = "Input",
            props = { name = "email", type = "email", label = "Email", required = true }
          },
          {
            type = "TextArea",
            props = { name = "message", label = "Message", rows = 4 }
          },
          {
            type = "Button",
            props = { type = "submit", text = "Submit" }
          }
        }
      }
    }
  }
end

return M
