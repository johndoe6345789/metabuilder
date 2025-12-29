local M = {}

function M.handleFormSubmit(formData)
  print("Form submitted with data:")
  for key, value in pairs(formData) do
    print(string.format("  %s = %s", key, value))
  end

  return {
    success = true,
    message = "Form submitted successfully!"
  }
end

return M
