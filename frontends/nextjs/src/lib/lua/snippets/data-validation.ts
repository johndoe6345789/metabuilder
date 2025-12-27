import { LuaSnippet } from './types'

export const DATA_VALIDATION_SNIPPETS: LuaSnippet[] = [
  {
    id: 'validate_email',
    name: 'Email Validation',
    description: 'Validate email format using pattern matching',
    category: 'Data Validation',
    tags: ['validation', 'email', 'regex'],
    parameters: [
      { name: 'email', type: 'string', description: 'Email address to validate' }
    ],
    code: `local email = context.data.email or ""

if email == "" then
  return { valid = false, error = "Email is required" }
end

local pattern = "^[%w._%%-]+@[%w._%%-]+%.%w+$"
if not string.match(email, pattern) then
  return { valid = false, error = "Invalid email format" }
end

return { valid = true, email = email }`
  },
  {
    id: 'validate_password_strength',
    name: 'Password Strength Validator',
    description: 'Check password meets security requirements',
    category: 'Data Validation',
    tags: ['validation', 'password', 'security'],
    parameters: [
      { name: 'password', type: 'string', description: 'Password to validate' }
    ],
    code: `local password = context.data.password or ""

if string.len(password) < 8 then
  return { valid = false, error = "Password must be at least 8 characters" }
end

local hasUpper = string.match(password, "%u") ~= nil
local hasLower = string.match(password, "%l") ~= nil
local hasDigit = string.match(password, "%d") ~= nil
local hasSpecial = string.match(password, "[^%w]") ~= nil

if not hasUpper then
  return { valid = false, error = "Password must contain uppercase letter" }
end

if not hasLower then
  return { valid = false, error = "Password must contain lowercase letter" }
end

if not hasDigit then
  return { valid = false, error = "Password must contain a number" }
end

if not hasSpecial then
  return { valid = false, error = "Password must contain special character" }
end

return {
  valid = true,
  strength = "strong",
  score = 100
}`
  },
  {
    id: 'validate_phone',
    name: 'Phone Number Validation',
    description: 'Validate US phone number format',
    category: 'Data Validation',
    tags: ['validation', 'phone', 'format'],
    parameters: [
      { name: 'phone', type: 'string', description: 'Phone number to validate' }
    ],
    code: `local phone = context.data.phone or ""

local cleaned = string.gsub(phone, "[^%d]", "")

if string.len(cleaned) ~= 10 then
  return { valid = false, error = "Phone must be 10 digits" }
end

local formatted = string.format("(%s) %s-%s",
  string.sub(cleaned, 1, 3),
  string.sub(cleaned, 4, 6),
  string.sub(cleaned, 7, 10)
)

return {
  valid = true,
  cleaned = cleaned,
  formatted = formatted
}`
  },
  {
    id: 'validate_required_fields',
    name: 'Required Fields Validator',
    description: 'Check multiple required fields are present',
    category: 'Data Validation',
    tags: ['validation', 'required', 'form'],
    code: `local data = context.data or {}
local required = {"name", "email", "username"}
local missing = {}

for i, field in ipairs(required) do
  if not data[field] or data[field] == "" then
    table.insert(missing, field)
  end
end

if #missing > 0 then
  return {
    valid = false,
    error = "Missing required fields: " .. table.concat(missing, ", "),
    missing = missing
  }
end

return { valid = true }`
  }
]
