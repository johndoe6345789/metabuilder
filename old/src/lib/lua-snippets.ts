export interface LuaSnippet {
  id: string
  name: string
  description: string
  category: string
  code: string
  tags: string[]
  parameters?: Array<{ name: string; type: string; description: string }>
}

export const LUA_SNIPPET_CATEGORIES = [
  'All',
  'Data Validation',
  'Data Transformation',
  'Array Operations',
  'String Processing',
  'Math & Calculations',
  'Conditionals & Logic',
  'User Management',
  'Error Handling',
  'API & Networking',
  'Date & Time',
  'File Operations',
  'Utilities'
] as const

export const LUA_SNIPPETS: LuaSnippet[] = [
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
  },
  {
    id: 'transform_snake_to_camel',
    name: 'Snake Case to Camel Case',
    description: 'Convert snake_case strings to camelCase',
    category: 'Data Transformation',
    tags: ['transform', 'string', 'case'],
    parameters: [
      { name: 'text', type: 'string', description: 'Snake case text' }
    ],
    code: `local text = context.data.text or ""

local result = string.gsub(text, "_(%w)", function(c)
  return string.upper(c)
end)

return { 
  original = text,
  transformed = result 
}`
  },
  {
    id: 'transform_flatten_object',
    name: 'Flatten Nested Object',
    description: 'Convert nested table to flat key-value pairs',
    category: 'Data Transformation',
    tags: ['transform', 'object', 'flatten'],
    code: `local function flatten(tbl, prefix, result)
  result = result or {}
  prefix = prefix or ""
  
  for key, value in pairs(tbl) do
    local newKey = prefix == "" and key or prefix .. "." .. key
    
    if type(value) == "table" then
      flatten(value, newKey, result)
    else
      result[newKey] = value
    end
  end
  
  return result
end

local data = context.data or {}
local flattened = flatten(data)

return { 
  original = data,
  flattened = flattened 
}`
  },
  {
    id: 'transform_normalize_data',
    name: 'Normalize User Data',
    description: 'Clean and normalize user input data',
    category: 'Data Transformation',
    tags: ['transform', 'normalize', 'clean'],
    code: `local data = context.data or {}

local function trim(s)
  return string.match(s, "^%s*(.-)%s*$")
end

local normalized = {}

if data.email then
  normalized.email = string.lower(trim(data.email))
end

if data.name then
  normalized.name = trim(data.name)
  local words = {}
  for word in string.gmatch(normalized.name, "%S+") do
    table.insert(words, string.upper(string.sub(word, 1, 1)) .. string.lower(string.sub(word, 2)))
  end
  normalized.name = table.concat(words, " ")
end

if data.phone then
  normalized.phone = string.gsub(data.phone, "[^%d]", "")
end

return normalized`
  },
  {
    id: 'array_filter',
    name: 'Filter Array',
    description: 'Filter array elements by condition',
    category: 'Array Operations',
    tags: ['array', 'filter', 'collection'],
    parameters: [
      { name: 'items', type: 'array', description: 'Array to filter' },
      { name: 'minValue', type: 'number', description: 'Minimum value threshold' }
    ],
    code: `local items = context.data.items or {}
local minValue = context.data.minValue or 0
local filtered = {}

for i, item in ipairs(items) do
  if item.value >= minValue then
    table.insert(filtered, item)
  end
end

log("Filtered " .. #filtered .. " of " .. #items .. " items")

return { 
  original = items,
  filtered = filtered,
  count = #filtered 
}`
  },
  {
    id: 'array_map',
    name: 'Map Array',
    description: 'Transform each array element',
    category: 'Array Operations',
    tags: ['array', 'map', 'transform'],
    code: `local items = context.data.items or {}
local mapped = {}

for i, item in ipairs(items) do
  table.insert(mapped, {
    id = item.id,
    label = string.upper(item.name or ""),
    value = (item.value or 0) * 2,
    index = i
  })
end

return { 
  original = items,
  mapped = mapped 
}`
  },
  {
    id: 'array_reduce',
    name: 'Reduce Array to Sum',
    description: 'Calculate sum of numeric array values',
    category: 'Array Operations',
    tags: ['array', 'reduce', 'sum'],
    parameters: [
      { name: 'numbers', type: 'array', description: 'Array of numbers' }
    ],
    code: `local numbers = context.data.numbers or {}
local sum = 0
local count = 0

for i, num in ipairs(numbers) do
  sum = sum + (num or 0)
  count = count + 1
end

local average = count > 0 and sum / count or 0

return { 
  sum = sum,
  count = count,
  average = average 
}`
  },
  {
    id: 'array_group_by',
    name: 'Group Array by Property',
    description: 'Group array items by a property value',
    category: 'Array Operations',
    tags: ['array', 'group', 'aggregate'],
    code: `local items = context.data.items or {}
local groupKey = context.data.groupKey or "category"
local groups = {}

for i, item in ipairs(items) do
  local key = item[groupKey] or "uncategorized"
  
  if not groups[key] then
    groups[key] = {}
  end
  
  table.insert(groups[key], item)
end

local summary = {}
for key, group in pairs(groups) do
  summary[key] = #group
end

return { 
  groups = groups,
  summary = summary 
}`
  },
  {
    id: 'array_sort',
    name: 'Sort Array',
    description: 'Sort array by property value',
    category: 'Array Operations',
    tags: ['array', 'sort', 'order'],
    code: `local items = context.data.items or {}
local sortKey = context.data.sortKey or "value"
local descending = context.data.descending or false

table.sort(items, function(a, b)
  if descending then
    return (a[sortKey] or 0) > (b[sortKey] or 0)
  else
    return (a[sortKey] or 0) < (b[sortKey] or 0)
  end
end)

return { 
  sorted = items,
  count = #items 
}`
  },
  {
    id: 'string_slugify',
    name: 'Create URL Slug',
    description: 'Convert text to URL-friendly slug',
    category: 'String Processing',
    tags: ['string', 'slug', 'url'],
    parameters: [
      { name: 'text', type: 'string', description: 'Text to slugify' }
    ],
    code: `local text = context.data.text or ""

local slug = string.lower(text)
slug = string.gsub(slug, "%s+", "-")
slug = string.gsub(slug, "[^%w%-]", "")
slug = string.gsub(slug, "%-+", "-")
slug = string.gsub(slug, "^%-+", "")
slug = string.gsub(slug, "%-+$", "")

return { 
  original = text,
  slug = slug 
}`
  },
  {
    id: 'string_truncate',
    name: 'Truncate Text',
    description: 'Truncate long text with ellipsis',
    category: 'String Processing',
    tags: ['string', 'truncate', 'ellipsis'],
    parameters: [
      { name: 'text', type: 'string', description: 'Text to truncate' },
      { name: 'maxLength', type: 'number', description: 'Maximum length' }
    ],
    code: `local text = context.data.text or ""
local maxLength = context.data.maxLength or 50

if string.len(text) <= maxLength then
  return { 
    truncated = false,
    text = text 
  }
end

local truncated = string.sub(text, 1, maxLength - 3) .. "..."

return { 
  truncated = true,
  text = truncated,
  originalLength = string.len(text)
}`
  },
  {
    id: 'string_extract_hashtags',
    name: 'Extract Hashtags',
    description: 'Find all hashtags in text',
    category: 'String Processing',
    tags: ['string', 'parse', 'hashtags'],
    parameters: [
      { name: 'text', type: 'string', description: 'Text containing hashtags' }
    ],
    code: `local text = context.data.text or ""
local hashtags = {}

for tag in string.gmatch(text, "#(%w+)") do
  table.insert(hashtags, tag)
end

return { 
  text = text,
  hashtags = hashtags,
  count = #hashtags 
}`
  },
  {
    id: 'string_word_count',
    name: 'Word Counter',
    description: 'Count words and characters in text',
    category: 'String Processing',
    tags: ['string', 'count', 'statistics'],
    parameters: [
      { name: 'text', type: 'string', description: 'Text to analyze' }
    ],
    code: `local text = context.data.text or ""

local charCount = string.len(text)
local words = {}

for word in string.gmatch(text, "%S+") do
  table.insert(words, word)
end

local wordCount = #words

local sentences = 0
for _ in string.gmatch(text, "[.!?]+") do
  sentences = sentences + 1
end

return { 
  characters = charCount,
  words = wordCount,
  sentences = sentences,
  avgWordLength = wordCount > 0 and charCount / wordCount or 0
}`
  },
  {
    id: 'math_percentage',
    name: 'Calculate Percentage',
    description: 'Calculate percentage and format result',
    category: 'Math & Calculations',
    tags: ['math', 'percentage', 'calculation'],
    parameters: [
      { name: 'value', type: 'number', description: 'Partial value' },
      { name: 'total', type: 'number', description: 'Total value' }
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
}`
  },
  {
    id: 'math_discount',
    name: 'Calculate Discount',
    description: 'Calculate price after discount',
    category: 'Math & Calculations',
    tags: ['math', 'discount', 'price'],
    parameters: [
      { name: 'price', type: 'number', description: 'Original price' },
      { name: 'discount', type: 'number', description: 'Discount percentage' }
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
}`
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
      { name: 'years', type: 'number', description: 'Number of years' }
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
}`
  },
  {
    id: 'math_statistics',
    name: 'Statistical Analysis',
    description: 'Calculate mean, median, mode, std dev',
    category: 'Math & Calculations',
    tags: ['math', 'statistics', 'analysis'],
    parameters: [
      { name: 'numbers', type: 'array', description: 'Array of numbers' }
    ],
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
}`
  },
  {
    id: 'conditional_role_check',
    name: 'Role-Based Access Check',
    description: 'Check if user has required role',
    category: 'Conditionals & Logic',
    tags: ['conditional', 'role', 'access'],
    parameters: [
      { name: 'requiredRole', type: 'string', description: 'Required role level' }
    ],
    code: `local user = context.user or {}
local requiredRole = context.data.requiredRole or "user"

local roles = {
  user = 1,
  moderator = 2,
  admin = 3,
  god = 4
}

local userLevel = roles[user.role] or 0
local requiredLevel = roles[requiredRole] or 0

local hasAccess = userLevel >= requiredLevel

return { 
  user = user.username,
  userRole = user.role,
  requiredRole = requiredRole,
  hasAccess = hasAccess,
  message = hasAccess and "Access granted" or "Access denied"
}`
  },
  {
    id: 'conditional_time_based',
    name: 'Time-Based Logic',
    description: 'Execute logic based on time of day',
    category: 'Conditionals & Logic',
    tags: ['conditional', 'time', 'schedule'],
    code: `local hour = tonumber(os.date("%H"))
local timeOfDay = ""
local greeting = ""

if hour >= 5 and hour < 12 then
  timeOfDay = "morning"
  greeting = "Good morning"
elseif hour >= 12 and hour < 17 then
  timeOfDay = "afternoon"
  greeting = "Good afternoon"
elseif hour >= 17 and hour < 21 then
  timeOfDay = "evening"
  greeting = "Good evening"
else
  timeOfDay = "night"
  greeting = "Good night"
end

local isBusinessHours = hour >= 9 and hour < 17

return { 
  currentHour = hour,
  timeOfDay = timeOfDay,
  greeting = greeting,
  isBusinessHours = isBusinessHours
}`
  },
  {
    id: 'conditional_feature_flag',
    name: 'Feature Flag Checker',
    description: 'Check if feature is enabled for user',
    category: 'Conditionals & Logic',
    tags: ['conditional', 'feature', 'flag'],
    code: `local user = context.user or {}
local feature = context.data.feature or ""

local enabledFeatures = {
  betaUI = {"admin", "god"},
  advancedSearch = {"moderator", "admin", "god"},
  exportData = {"admin", "god"},
  debugMode = {"god"}
}

local allowedRoles = enabledFeatures[feature] or {}
local isEnabled = false

for i, role in ipairs(allowedRoles) do
  if user.role == role then
    isEnabled = true
    break
  end
end

return { 
  feature = feature,
  userRole = user.role,
  enabled = isEnabled,
  reason = isEnabled and "Feature available" or "Feature not available for your role"
}`
  },
  {
    id: 'error_try_catch',
    name: 'Try-Catch Pattern',
    description: 'Safe execution with error handling',
    category: 'Error Handling',
    tags: ['error', 'exception', 'safety'],
    code: `local function riskyOperation()
  local data = context.data or {}
  
  if not data.value then
    error("Value is required")
  end
  
  if data.value < 0 then
    error("Value must be positive")
  end
  
  return data.value * 2
end

local success, result = pcall(riskyOperation)

if success then
  log("Operation successful: " .. tostring(result))
  return { 
    success = true,
    result = result 
  }
else
  log("Operation failed: " .. tostring(result))
  return { 
    success = false,
    error = tostring(result)
  }
end`
  },
  {
    id: 'error_validation_accumulator',
    name: 'Validation Error Accumulator',
    description: 'Collect all validation errors at once',
    category: 'Error Handling',
    tags: ['error', 'validation', 'accumulator'],
    code: `local data = context.data or {}
local errors = {}

if not data.name or data.name == "" then
  table.insert(errors, "Name is required")
end

if not data.email or data.email == "" then
  table.insert(errors, "Email is required")
elseif not string.match(data.email, "@") then
  table.insert(errors, "Email format is invalid")
end

if not data.age then
  table.insert(errors, "Age is required")
elseif data.age < 18 then
  table.insert(errors, "Must be 18 or older")
end

if #errors > 0 then
  return { 
    valid = false,
    errors = errors,
    count = #errors
  }
end

return { 
  valid = true,
  data = data 
}`
  },
  {
    id: 'user_profile_builder',
    name: 'Build User Profile',
    description: 'Create complete user profile from data',
    category: 'User Management',
    tags: ['user', 'profile', 'builder'],
    code: `local data = context.data or {}

local profile = {
  id = "user_" .. os.time(),
  username = data.username or "",
  email = string.lower(data.email or ""),
  displayName = data.displayName or data.username or "",
  role = "user",
  status = "active",
  createdAt = os.time(),
  metadata = {
    source = "registration",
    version = "1.0"
  },
  preferences = {
    theme = "light",
    notifications = true,
    language = "en"
  }
}

log("Created profile for: " .. profile.username)

return profile`
  },
  {
    id: 'user_activity_logger',
    name: 'Log User Activity',
    description: 'Create activity log entry',
    category: 'User Management',
    tags: ['user', 'activity', 'logging'],
    code: `local user = context.user or {}
local action = context.data.action or "unknown"
local details = context.data.details or {}

local activity = {
  id = "activity_" .. os.time(),
  userId = user.id or "unknown",
  username = user.username or "anonymous",
  action = action,
  details = details,
  timestamp = os.time(),
  date = os.date("%Y-%m-%d %H:%M:%S"),
  ipAddress = "0.0.0.0",
  userAgent = "MetaBuilder/1.0"
}

log("Activity logged: " .. user.username .. " - " .. action)

return activity`
  },
  {
    id: 'date_format',
    name: 'Format Date',
    description: 'Format timestamp in various ways',
    category: 'Date & Time',
    tags: ['date', 'time', 'format'],
    parameters: [
      { name: 'timestamp', type: 'number', description: 'Unix timestamp' }
    ],
    code: `local timestamp = context.data.timestamp or os.time()

local formatted = {
  full = os.date("%Y-%m-%d %H:%M:%S", timestamp),
  date = os.date("%Y-%m-%d", timestamp),
  time = os.date("%H:%M:%S", timestamp),
  readable = os.date("%B %d, %Y at %I:%M %p", timestamp),
  iso = os.date("%Y-%m-%dT%H:%M:%S", timestamp),
  unix = timestamp
}

return formatted`
  },
  {
    id: 'date_diff',
    name: 'Calculate Date Difference',
    description: 'Calculate difference between two dates',
    category: 'Date & Time',
    tags: ['date', 'time', 'difference'],
    parameters: [
      { name: 'startTime', type: 'number', description: 'Start timestamp' },
      { name: 'endTime', type: 'number', description: 'End timestamp' }
    ],
    code: `local startTime = context.data.startTime or os.time()
local endTime = context.data.endTime or os.time()

local diffSeconds = math.abs(endTime - startTime)
local diffMinutes = math.floor(diffSeconds / 60)
local diffHours = math.floor(diffMinutes / 60)
local diffDays = math.floor(diffHours / 24)

return { 
  startTime = startTime,
  endTime = endTime,
  difference = {
    seconds = diffSeconds,
    minutes = diffMinutes,
    hours = diffHours,
    days = diffDays
  },
  formatted = diffDays .. " days, " .. (diffHours % 24) .. " hours"
}`
  },
  {
    id: 'json_parse',
    name: 'Safe JSON Parse',
    description: 'Parse JSON string with error handling',
    category: 'Utilities',
    tags: ['json', 'parse', 'utility'],
    parameters: [
      { name: 'jsonString', type: 'string', description: 'JSON string to parse' }
    ],
    code: `local jsonString = context.data.jsonString or "{}"

local function parseJSON(str)
  local result = {}
  return result
end

local success, data = pcall(parseJSON, jsonString)

if success then
  return { 
    success = true,
    data = data 
  }
else
  return { 
    success = false,
    error = "Invalid JSON format"
  }
end`
  },
  {
    id: 'generate_id',
    name: 'Generate Unique ID',
    description: 'Create unique identifier',
    category: 'Utilities',
    tags: ['id', 'uuid', 'generator'],
    code: `local function generateId(prefix)
  local timestamp = os.time()
  local random = math.random(1000, 9999)
  return (prefix or "id") .. "_" .. timestamp .. "_" .. random
end

local id = generateId(context.data.prefix)

return { 
  id = id,
  timestamp = os.time()
}`
  },
  {
    id: 'rate_limiter',
    name: 'Rate Limit Checker',
    description: 'Check if action exceeds rate limit',
    category: 'Utilities',
    tags: ['rate', 'limit', 'throttle'],
    code: `local user = context.user or {}
local action = context.data.action or "default"
local maxAttempts = context.data.maxAttempts or 5
local windowSeconds = context.data.windowSeconds or 60

local currentTime = os.time()
local attempts = 1

local allowed = attempts <= maxAttempts

return { 
  allowed = allowed,
  attempts = attempts,
  maxAttempts = maxAttempts,
  remaining = maxAttempts - attempts,
  resetTime = currentTime + windowSeconds,
  message = allowed and "Request allowed" or "Rate limit exceeded"
}`
  },
  {
    id: 'cache_manager',
    name: 'Simple Cache Manager',
    description: 'Cache data with expiration',
    category: 'Utilities',
    tags: ['cache', 'storage', 'ttl'],
    code: `local key = context.data.key or "cache_key"
local value = context.data.value
local ttl = context.data.ttl or 300

local cached = {
  key = key,
  value = value,
  cachedAt = os.time(),
  expiresAt = os.time() + ttl,
  ttl = ttl
}

log("Cached " .. key .. " for " .. ttl .. " seconds")

return cached`
  }
]

export function getSnippetsByCategory(category: string): LuaSnippet[] {
  if (category === 'All') {
    return LUA_SNIPPETS
  }
  return LUA_SNIPPETS.filter(snippet => snippet.category === category)
}

export function searchSnippets(query: string): LuaSnippet[] {
  const lowerQuery = query.toLowerCase()
  return LUA_SNIPPETS.filter(snippet => 
    snippet.name.toLowerCase().includes(lowerQuery) ||
    snippet.description.toLowerCase().includes(lowerQuery) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

export function getSnippetById(id: string): LuaSnippet | undefined {
  return LUA_SNIPPETS.find(snippet => snippet.id === id)
}
