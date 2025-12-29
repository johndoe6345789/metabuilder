-- Textarea field component
local function textarea(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "TextArea", props = { name = props.name, rows = props.rows or 4, placeholder = props.placeholder } }
    }
  }
end

return textarea
