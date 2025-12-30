-- Number field component

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class NumberFieldProps
---@field name string
---@field label? string
---@field min? number
---@field max? number

---@param props NumberFieldProps
---@return UIComponent
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
