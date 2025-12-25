/**
 * Get Severity Color
 * Returns appropriate color classes for a severity level
 */

/**
 * Get color classes for displaying severity
 * @param severity - The severity level
 * @returns MUI-compatible color string
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'error'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'secondary'
    default:
      return 'success'
  }
}
