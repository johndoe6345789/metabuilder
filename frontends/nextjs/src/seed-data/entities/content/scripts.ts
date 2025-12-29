import { Database } from '@/lib/database'
import type { LuaScript } from '@/lib/level-types'

export async function initializeScripts() {
  const existingScripts = await Database.getLuaScripts()
  if (existingScripts.length > 0) {
    return
  }

  const scripts: LuaScript[] = [
    {
      id: 'script_welcome_message',
      name: 'Welcome Message Generator',
      description: 'Generates a personalized welcome message',
      code: `
function generateWelcome(username)
  return "Welcome back, " .. username .. "! Great to see you again."
end

return generateWelcome
`,
      parameters: [{ name: 'username', type: 'string' }],
      returnType: 'string',
    },
    {
      id: 'script_format_date',
      name: 'Date Formatter',
      description: 'Formats timestamp to readable date',
      code: `
function formatDate(timestamp)
  local date = os.date("*t", timestamp / 1000)
  return string.format("%04d-%02d-%02d %02d:%02d", 
    date.year, date.month, date.day, date.hour, date.min)
end

return formatDate
`,
      parameters: [{ name: 'timestamp', type: 'number' }],
      returnType: 'string',
    },
    {
      id: 'script_validate_email',
      name: 'Email Validator',
      description: 'Validates email format',
      code: `
function validateEmail(email)
  if not email then return false end
  local pattern = "^[%w%._%%-]+@[%w%._%%-]+%.%w+$"
  return string.match(email, pattern) ~= nil
end

return validateEmail
`,
      parameters: [{ name: 'email', type: 'string' }],
      returnType: 'boolean',
    },
    {
      id: 'script_permission_check',
      name: 'Custom Permission Checker',
      description: 'Checks if user has custom permission',
      code: `
function checkPermission(userRole, requiredRole)
  local roleHierarchy = {
    public = 1,
    user = 2,
    moderator = 3,
    admin = 4,
    god = 5,
    supergod = 6
  }
  
  local userLevel = roleHierarchy[userRole] or 0
  local requiredLevel = roleHierarchy[requiredRole] or 0
  
  return userLevel >= requiredLevel
end

return checkPermission
`,
      parameters: [
        { name: 'userRole', type: 'string' },
        { name: 'requiredRole', type: 'string' },
      ],
      returnType: 'boolean',
    },
    {
      id: 'script_page_load_analytics',
      name: 'Page Load Analytics',
      description: 'Logs page view for analytics',
      code: `
function logPageView(pageId, userId, timestamp)
  print("Page view: " .. pageId .. " by user " .. userId .. " at " .. timestamp)
  return true
end

return logPageView
`,
      parameters: [
        { name: 'pageId', type: 'string' },
        { name: 'userId', type: 'string' },
        { name: 'timestamp', type: 'number' },
      ],
      returnType: 'boolean',
    },
  ]

  for (const script of scripts) {
    await Database.addLuaScript(script)
  }
}
