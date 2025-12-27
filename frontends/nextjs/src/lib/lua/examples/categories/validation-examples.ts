/**
 * @file validation-examples.ts
 * @description Validation and business logic Lua examples
 */

export const validationExamples = {
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
}
