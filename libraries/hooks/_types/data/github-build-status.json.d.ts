/**
 * Type declaration for @/data/github-build-status.json
 */
declare const content: {
  toast: {
    badgeCopied: string
    [key: string]: string
  }
  time: {
    daysAgo: string
    hoursAgo: string
    minutesAgo: string
    justNow: string
    [key: string]: string
  }
  [key: string]: unknown
}

export default content
