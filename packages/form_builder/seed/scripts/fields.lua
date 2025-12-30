---@class Fields
local M = {}

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class TextFieldProps
---@field name string
---@field label? string
---@field placeholder? string
---@field required? boolean

---@class EmailFieldProps
---@field name string
---@field label? string

---@class PasswordFieldProps
---@field name string
---@field label? string

---@class NumberFieldProps
---@field name string
---@field label? string
---@field min? number
---@field max? number

---@class TextAreaFieldProps
---@field name string
---@field label? string
---@field placeholder? string
---@field rows? number

---@param props TextFieldProps
---@return UIComponent
function M.text(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "Input", props = { name = props.name, placeholder = props.placeholder, required = props.required } }
    }
  }
end

---@param props EmailFieldProps
---@return UIComponent
function M.email(props)
  return {
    type = "Box",
    children = {
      { type = "Label", props = { text = props.label or "Email", htmlFor = props.name } },
      { type = "Input", props = { name = props.name, type = "email", placeholder = "you@example.com" } }
    }
  }
end

---@param props PasswordFieldProps
---@return UIComponent
function M.password(props)
  return {
    type = "Box",
    children = {
      { type = "Label", props = { text = props.label or "Password", htmlFor = props.name } },
      { type = "Input", props = { name = props.name, type = "password", placeholder = "••••••••" } }
    }
  }
end

---@param props NumberFieldProps
---@return UIComponent
function M.number(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "Input", props = { name = props.name, type = "number", min = props.min, max = props.max } }
    }
  }
end

---@param props TextAreaFieldProps
---@return UIComponent
function M.textarea(props)
  return {
    type = "Box",
    children = {
      props.label and { type = "Label", props = { text = props.label, htmlFor = props.name } } or nil,
      { type = "TextArea", props = { name = props.name, rows = props.rows or 4, placeholder = props.placeholder } }
    }
  }
end

return M
