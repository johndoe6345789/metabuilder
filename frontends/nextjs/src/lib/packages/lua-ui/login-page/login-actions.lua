local M = {}

function M.handleLogin(formData)
  -- This will be called from React with form data
  print("Login attempt for user:", formData.username)

  -- Return result that React can handle
  return {
    action = "login",
    username = formData.username,
    password = formData.password
  }
end

function M.handleRegister(formData)
  print("Registration attempt for:", formData.username, formData.email)

  return {
    action = "register",
    username = formData.username,
    email = formData.email
  }
end

return M
