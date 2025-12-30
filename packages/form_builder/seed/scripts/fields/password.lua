-- Password field component

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class PasswordFieldProps
---@field name string
---@field label? string

---@param props PasswordFieldProps
---@return UIComponent
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
