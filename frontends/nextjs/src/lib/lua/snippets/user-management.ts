import { LuaSnippet } from './types'

export const USER_MANAGEMENT_SNIPPETS: LuaSnippet[] = [
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

return profile`,
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

return activity`,
  },
]
