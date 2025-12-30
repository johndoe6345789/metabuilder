-- Form validation email rule
local function email(message)
  return {
    type = "email",
    pattern = "^[^@]+@[^@]+%.[^@]+$",
    message = message or "Please enter a valid email"
  }
end

return email
