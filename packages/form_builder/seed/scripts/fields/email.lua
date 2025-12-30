-- Email field component

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class EmailFieldProps
---@field name string
---@field label? string

---@param props EmailFieldProps
---@return UIComponent
local function email(props)
  return {
    type = "Box",
    children = {
      { type = "Label", props = { text = props.label or "Email", htmlFor = props.name } },
      { type = "Input", props = { name = props.name, type = "email", placeholder = "you@example.com" } }
    }
  }
end

return email
