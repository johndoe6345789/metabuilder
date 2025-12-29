import { LuaSnippet } from './types'

export const MATH_CALCULATION_SNIPPETS: LuaSnippet[] = [
  {
    id: 'math_percentage',
    name: 'Calculate Percentage',
    description: 'Calculate percentage and format result',
    category: 'Math & Calculations',
    tags: ['math', 'percentage', 'calculation'],
    parameters: [
      { name: 'value', type: 'number', description: 'Partial value' },
      { name: 'total', type: 'number', description: 'Total value' },
    ],
    code: `local value = context.data.value or 0
local total = context.data.total or 1

if total == 0 then
  return {
    error = "Cannot divide by zero",
    percentage = 0
  }
end

local percentage = (value / total) * 100
local formatted = string.format("%.2f%%", percentage)

return {
  value = value,
  total = total,
  percentage = percentage,
  formatted = formatted
}`,
  },
  {
    id: 'math_discount',
    name: 'Calculate Discount',
    description: 'Calculate price after discount',
    category: 'Math & Calculations',
    tags: ['math', 'discount', 'price'],
    parameters: [
      { name: 'price', type: 'number', description: 'Original price' },
      { name: 'discount', type: 'number', description: 'Discount percentage' },
    ],
    code: `local price = context.data.price or 0
local discount = context.data.discount or 0

local discountAmount = price * (discount / 100)
local finalPrice = price - discountAmount
local savings = discountAmount

return {
  originalPrice = price,
  discountPercent = discount,
  discountAmount = discountAmount,
  finalPrice = finalPrice,
  savings = savings,
  formatted = "$" .. string.format("%.2f", finalPrice)
}`,
  },
  {
    id: 'math_compound_interest',
    name: 'Compound Interest Calculator',
    description: 'Calculate compound interest over time',
    category: 'Math & Calculations',
    tags: ['math', 'interest', 'finance'],
    parameters: [
      { name: 'principal', type: 'number', description: 'Initial amount' },
      { name: 'rate', type: 'number', description: 'Interest rate (%)' },
      { name: 'years', type: 'number', description: 'Number of years' },
    ],
    code: `local principal = context.data.principal or 1000
local rate = (context.data.rate or 5) / 100
local years = context.data.years or 1
local compounds = 12

local amount = principal * math.pow(1 + (rate / compounds), compounds * years)
local interest = amount - principal

return {
  principal = principal,
  rate = rate * 100,
  years = years,
  finalAmount = amount,
  interestEarned = interest,
  formatted = "$" .. string.format("%.2f", amount)
}`,
  },
  {
    id: 'math_statistics',
    name: 'Statistical Analysis',
    description: 'Calculate mean, median, mode, std dev',
    category: 'Math & Calculations',
    tags: ['math', 'statistics', 'analysis'],
    parameters: [{ name: 'numbers', type: 'array', description: 'Array of numbers' }],
    code: `local numbers = context.data.numbers or {1, 2, 3, 4, 5}

local sum = 0
local min = numbers[1]
local max = numbers[1]

for i, num in ipairs(numbers) do
  sum = sum + num
  if num < min then min = num end
  if num > max then max = num end
end

local mean = sum / #numbers

table.sort(numbers)
local median
if #numbers % 2 == 0 then
  median = (numbers[#numbers/2] + numbers[#numbers/2 + 1]) / 2
else
  median = numbers[math.ceil(#numbers/2)]
end

local variance = 0
for i, num in ipairs(numbers) do
  variance = variance + math.pow(num - mean, 2)
end
variance = variance / #numbers

local stdDev = math.sqrt(variance)

return {
  count = #numbers,
  sum = sum,
  mean = mean,
  median = median,
  min = min,
  max = max,
  variance = variance,
  stdDev = stdDev,
  range = max - min
}`,
  },
]
