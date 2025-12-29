-- Text field component
local function text(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "Input", props = { name = props.name, placeholder = props.placeholder, required = props.required } }
    }
  }
end

return text
