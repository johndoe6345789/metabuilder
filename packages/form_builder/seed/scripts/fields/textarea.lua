-- Textarea field component

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class TextareaFieldProps
---@field name string
---@field label? string
---@field rows? number
---@field placeholder? string

---@param props TextareaFieldProps
---@return UIComponent
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
