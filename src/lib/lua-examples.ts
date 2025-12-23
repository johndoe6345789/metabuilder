export const LUA_EXAMPLES = {
  basic: `-- Basic Hello World
log("Hello from Lua!")
return { message = "Success", timestamp = os.time() }`,

  dataProcessing: `-- Data Processing Example
-- Access parameters via context.data
log("Processing data...")

local input = context.data or {}
local result = {
  count = 0,
  items = {}
}

if input.items then
  for i, item in ipairs(input.items) do
    if item.value > 10 then
      result.count = result.count + 1
      table.insert(result.items, item)
    end
  end
end

log("Found " .. result.count .. " items")
return result`,

  validation: `-- Validation Example
-- Returns true/false based on validation rules
local data = context.data or {}

if not data.email then
  log("Error: Email is required")
  return { valid = false, error = "Email is required" }
end

if not string.match(data.email, "@") then
  log("Error: Invalid email format")
  return { valid = false, error = "Invalid email format" }
end

if data.age and data.age < 18 then
  log("Error: Must be 18 or older")
  return { valid = false, error = "Must be 18 or older" }
end

log("Validation passed")
return { valid = true }`,

  transformation: `-- Data Transformation Example
-- Transform input data structure
local input = context.data or {}

local output = {
  fullName = (input.firstName or "") .. " " .. (input.lastName or ""),
  displayAge = tostring(input.age or 0) .. " years old",
  status = input.isActive and "Active" or "Inactive",
  metadata = {
    processedAt = os.time(),
    processedBy = "lua_transform"
  }
}

log("Transformed data for: " .. output.fullName)
return output`,

  calculation: `-- Complex Calculation Example
-- Perform business logic calculations
local data = context.data or {}

local subtotal = data.price or 0
local quantity = data.quantity or 1
local discount = data.discount or 0

local total = subtotal * quantity
local discountAmount = total * (discount / 100)
local finalTotal = total - discountAmount

local taxRate = 0.08
local taxAmount = finalTotal * taxRate
local grandTotal = finalTotal + taxAmount

log("Calculation complete:")
log("  Subtotal: $" .. string.format("%.2f", subtotal))
log("  Quantity: " .. quantity)
log("  Discount: " .. discount .. "%")
log("  Tax: $" .. string.format("%.2f", taxAmount))
log("  Grand Total: $" .. string.format("%.2f", grandTotal))

return {
  subtotal = subtotal,
  quantity = quantity,
  discount = discount,
  discountAmount = discountAmount,
  taxAmount = taxAmount,
  grandTotal = grandTotal
}`,

  conditional: `-- Conditional Logic Example
-- Workflow decision making
local data = context.data or {}
local user = context.user or {}

log("Evaluating conditions...")

if user.role == "admin" then
  log("Admin user - granting full access")
  return { 
    approved = true, 
    accessLevel = "full",
    reason = "Admin override"
  }
end

if data.score and data.score >= 80 then
  log("Score passed threshold")
  return { 
    approved = true, 
    accessLevel = "standard",
    reason = "Score requirement met"
  }
end

if data.verified == true then
  log("User is verified")
  return { 
    approved = true, 
    accessLevel = "limited",
    reason = "Verified user"
  }
end

log("Conditions not met")
return { 
  approved = false, 
  accessLevel = "none",
  reason = "Requirements not satisfied"
}`,

  arrayOperations: `-- Array Operations Example
-- Working with lists and tables
local data = context.data or {}
local numbers = data.numbers or {1, 2, 3, 4, 5}

local sum = 0
local max = numbers[1] or 0
local min = numbers[1] or 0

for i, num in ipairs(numbers) do
  sum = sum + num
  if num > max then max = num end
  if num < min then min = num end
end

local average = sum / #numbers

log("Array statistics:")
log("  Count: " .. #numbers)
log("  Sum: " .. sum)
log("  Average: " .. string.format("%.2f", average))
log("  Min: " .. min)
log("  Max: " .. max)

return {
  count = #numbers,
  sum = sum,
  average = average,
  min = min,
  max = max,
  values = numbers
}`,

  stringManipulation: `-- String Manipulation Example
-- Text processing and formatting
local data = context.data or {}
local text = data.text or "hello world"

local upperText = string.upper(text)
local lowerText = string.lower(text)
local length = string.len(text)

local words = {}
for word in string.gmatch(text, "%S+") do
  table.insert(words, word)
end

local reversed = string.reverse(text)

local hasDigit = string.match(text, "%d") ~= nil
local hasSpecial = string.match(text, "[^%w%s]") ~= nil

log("Text analysis complete:")
log("  Length: " .. length)
log("  Words: " .. #words)
log("  Has digits: " .. tostring(hasDigit))

return {
  original = text,
  upper = upperText,
  lower = lowerText,
  length = length,
  wordCount = #words,
  words = words,
  reversed = reversed,
  hasDigit = hasDigit,
  hasSpecial = hasSpecial
}`
}

export function getLuaExampleCode(exampleKey: keyof typeof LUA_EXAMPLES): string {
  return LUA_EXAMPLES[exampleKey] || LUA_EXAMPLES.basic
}

export function getLuaExamplesList(): Array<{ key: keyof typeof LUA_EXAMPLES; name: string; description: string }> {
  return [
    { key: 'basic', name: 'Hello World', description: 'Simple logging and return value' },
    { key: 'dataProcessing', name: 'Data Processing', description: 'Filter and process array data' },
    { key: 'validation', name: 'Validation', description: 'Input validation with error messages' },
    { key: 'transformation', name: 'Data Transformation', description: 'Transform data structure' },
    { key: 'calculation', name: 'Calculations', description: 'Business logic calculations' },
    { key: 'conditional', name: 'Conditional Logic', description: 'Decision making and branching' },
    { key: 'arrayOperations', name: 'Array Operations', description: 'Statistical array processing' },
    { key: 'stringManipulation', name: 'String Manipulation', description: 'Text processing and analysis' },
  ]
}
