-- Codegen template component

---@class ComponentTemplate
---@field type string
---@field name string
---@field props table
---@field template string

---@param name string The name of the component
---@param props? table Optional component properties
---@return ComponentTemplate
local function component_template(name, props)
  return {
    type = "component",
    name = name,
    props = props or {},
    template = "react"
  }
end

return component_template
