-- Password field component
local function password(props)
  return {
    type = "Box",
    children = {
      { type = "Label", props = { text = props.label or "Password", htmlFor = props.name } },
      { type = "Input", props = { name = props.name, type = "password", placeholder = "••••••••" } }
    }
  }
end

return password
