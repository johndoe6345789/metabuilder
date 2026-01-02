--- Validates test file structure
---@param filepath string Path to the test file
---@param content string File content
---@return string[] errors List of errors
---@return string[] warnings List of warnings
local function validate_test_file(filepath, content)
  local errors = {}
  local warnings = {}

  -- Check for describe blocks
  if not string.match(content, "describe%(") then
    table.insert(warnings, filepath .. ": Missing describe() blocks")
  end

  -- Check for it/test blocks
  if not string.match(content, "it%(") and not string.match(content, "test%(") then
    table.insert(warnings, filepath .. ": Missing it() or test() blocks")
  end

  -- Check for expect assertions
  if not string.match(content, "expect%(") then
    table.insert(warnings, filepath .. ": Missing expect() assertions")
  end

  return errors, warnings
end

return validate_test_file
