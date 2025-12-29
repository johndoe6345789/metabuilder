local M = {}

function M.text(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "Input", props = { name = props.name, placeholder = props.placeholder, required = props.required } }
    }
  }
end

function M.email(props)
  return {
    type = "Box",
    children = {
      { type = "Label", props = { text = props.label or "Email", htmlFor = props.name } },
      { type = "Input", props = { name = props.name, type = "email", placeholder = "you@example.com" } }
    }
  }
end

function M.password(props)
  return {
    type = "Box",
    children = {
      { type = "Label", props = { text = props.label or "Password", htmlFor = props.name } },
      { type = "Input", props = { name = props.name, type = "password", placeholder = "••••••••" } }
    }
  }
end

function M.number(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "Input", props = { name = props.name, type = "number", min = props.min, max = props.max } }
    }
  }
end

function M.textarea(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "TextArea", props = { name = props.name, rows = props.rows or 4, placeholder = props.placeholder } }
    }
  }
end

return M
