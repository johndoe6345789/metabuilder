# Lua Snippet Library - Quick Reference

The MetaBuilder Lua Snippet Library provides 30+ pre-built code templates to accelerate your development workflow.

## Categories

### Data Validation
- **Email Validation** - Validate email format using pattern matching
- **Password Strength Validator** - Check password meets security requirements
- **Phone Number Validation** - Validate US phone number format
- **Required Fields Validator** - Check multiple required fields are present

### Data Transformation
- **Snake Case to Camel Case** - Convert snake_case strings to camelCase
- **Flatten Nested Object** - Convert nested table to flat key-value pairs
- **Normalize User Data** - Clean and normalize user input data

### Array Operations
- **Filter Array** - Filter array elements by condition
- **Map Array** - Transform each array element
- **Reduce Array to Sum** - Calculate sum of numeric array values
- **Group Array by Property** - Group array items by a property value
- **Sort Array** - Sort array by property value

### String Processing
- **Create URL Slug** - Convert text to URL-friendly slug
- **Truncate Text** - Truncate long text with ellipsis
- **Extract Hashtags** - Find all hashtags in text
- **Word Counter** - Count words and characters in text

### Math & Calculations
- **Calculate Percentage** - Calculate percentage and format result
- **Calculate Discount** - Calculate price after discount
- **Compound Interest Calculator** - Calculate compound interest over time
- **Statistical Analysis** - Calculate mean, median, mode, std dev

### Conditionals & Logic
- **Role-Based Access Check** - Check if user has required role
- **Time-Based Logic** - Execute logic based on time of day
- **Feature Flag Checker** - Check if feature is enabled for user

### Error Handling
- **Try-Catch Pattern** - Safe execution with error handling
- **Validation Error Accumulator** - Collect all validation errors at once

### User Management
- **Build User Profile** - Create complete user profile from data
- **Log User Activity** - Create activity log entry

### Date & Time
- **Format Date** - Format timestamp in various ways
- **Calculate Date Difference** - Calculate difference between two dates

### Utilities
- **Safe JSON Parse** - Parse JSON string with error handling
- **Generate Unique ID** - Create unique identifier
- **Rate Limit Checker** - Check if action exceeds rate limit
- **Simple Cache Manager** - Cache data with expiration

## Usage

### In the Lua Editor
1. Click the **"Snippet Library"** button in the Lua code section
2. Browse categories or use the search bar
3. Click a snippet card to preview details
4. Click **"Insert"** to add the code at your cursor position
5. Customize the code for your needs

### Standalone View
1. Navigate to the **"Snippet Library"** tab in Level 4
2. Search or filter by category
3. Click any snippet to view full details
4. Click **"Copy"** to copy to clipboard

## Context API

All snippets use the MetaBuilder context API:

```lua
-- Access input data
local data = context.data or {}

-- Access current user
local user = context.user or {}

-- Log messages
log("Processing started...")

-- Return results
return { success = true, result = processedData }
```

## Common Patterns

### Validation Pattern
```lua
local data = context.data or {}

if not data.field then
  return { valid = false, error = "Field is required" }
end

if not validateCondition(data.field) then
  return { valid = false, error = "Validation failed" }
end

return { valid = true, data = data }
```

### Transformation Pattern
```lua
local input = context.data or {}

local output = {
  field1 = transform(input.field1),
  field2 = normalize(input.field2),
  metadata = {
    processedAt = os.time(),
    version = "1.0"
  }
}

return output
```

### Error Handling Pattern
```lua
local function riskyOperation()
  -- operation that might fail
end

local success, result = pcall(riskyOperation)

if success then
  return { success = true, result = result }
else
  log("Error: " .. tostring(result))
  return { success = false, error = tostring(result) }
end
```

## Tips

- **Search by functionality** - Use keywords like "validate", "calculate", "transform"
- **Check tags** - Tags help identify snippet capabilities quickly
- **Review parameters** - Each snippet documents required input parameters
- **Customize freely** - Snippets are starting points, modify as needed
- **Combine patterns** - Mix multiple snippets for complex logic
- **Test thoroughly** - Use the test runner to verify behavior with sample data

## Adding Custom Snippets

While the library comes with 30+ pre-built snippets, you can:
1. Copy existing snippets as templates
2. Modify to fit your use case
3. Save as new Lua scripts in your project
4. Reference from workflows

## Best Practices

✅ **Do:**
- Use descriptive variable names
- Add comments for complex logic
- Validate input data before processing
- Return structured results
- Log important steps
- Handle edge cases

❌ **Avoid:**
- Infinite loops (workflows have execution limits)
- Blocking operations
- Modifying global state
- Assuming data exists without checks
- Returning undefined or null values

## Support

For questions about snippets or to request new patterns:
- Check the snippet description and parameter docs
- Test with sample data in the Lua editor
- Review execution logs for debugging
- Consult the Lua language documentation
