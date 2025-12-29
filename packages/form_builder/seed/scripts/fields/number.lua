-- Number field component
local function number(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "Input", props = { name = props.name, type = "number", min = props.min, max = props.max } }
    }
  }
end

return number
