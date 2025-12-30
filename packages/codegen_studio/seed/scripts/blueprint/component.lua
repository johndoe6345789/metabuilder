-- Codegen template component
local function component_template(name, props)
  return {
    type = "component",
    name = name,
    props = props or {},
    template = "react"
  }
end

return component_template
