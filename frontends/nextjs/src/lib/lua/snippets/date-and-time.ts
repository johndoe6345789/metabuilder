import { LuaSnippet } from './types'

export const DATE_AND_TIME_SNIPPETS: LuaSnippet[] = [
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
  }
]
