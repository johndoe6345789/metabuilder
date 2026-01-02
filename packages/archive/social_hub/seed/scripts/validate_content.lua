--- Validate post content
---@param content? string Post content to validate
---@return ValidationResult Validation result
local function validate_content(content)
  if not content or content == "" then
    return { valid = false, error = "Post cannot be empty" }
  end
  if #content > 500 then
    return { valid = false, error = "Post too long (max 500 chars)" }
  end
  return { valid = true }
end

return validate_content
