/**
 * Get Severity Icon
 * Returns appropriate emoji icon for a severity level
 */

/**
 * Get emoji icon for displaying severity
 * @param severity - The severity level
 * @returns Emoji representing the severity
 */
export const getSeverityIcon = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return '🚨'
    case 'high':
      return '⚠️'
    case 'medium':
      return '⚡'
    case 'low':
      return 'ℹ️'
    default:
      return '✓'
  }
}
