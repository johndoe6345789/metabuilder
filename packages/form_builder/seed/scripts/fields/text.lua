-- Text field component

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class TextFieldProps
---@field name string
---@field label? string
---@field placeholder? string
---@field required? boolean

---@param props TextFieldProps
---@return UIComponent
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
