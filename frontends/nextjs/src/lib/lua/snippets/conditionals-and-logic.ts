import { LuaSnippet } from './types'

export const CONDITIONAL_LOGIC_SNIPPETS: LuaSnippet[] = [
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
  public = 1,
  user = 2,
  moderator = 3,
  admin = 4,
  god = 5,
  supergod = 6
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
  }
]
