/**
 * What a package failure says to the person who caused it.
 *
 * There were two of these tables -- one here in package-utils, one in
 * package-page-handlers -- covering the same codes with different words for
 * four of them, so the same failure read differently depending on which path
 * handled it. This is the single table; the more specific wording won, since
 * "Package not found. It may have been removed." tells the reader what to do
 * next and "Package not found." does not.
 */

export const PACKAGE_ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  ALREADY_INSTALLED: 'This package is already installed.',
  ALREADY_UNINSTALLED: 'This package is not installed.',
  MISSING_DEPENDENCIES:
    'This package has missing dependencies. Please install them first.',
  PACKAGE_NOT_FOUND: 'Package not found. It may have been removed.',
  PERMISSION_DENIED: "You don't have permission to manage packages.",
  DEPENDENCY_ERROR:
    'This package cannot be uninstalled because other packages depend on it.',
  INVALID_PACKAGE_ID: 'Invalid package ID.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
}

/** The code an error carries, or '' when it carries none. */
export function errorCodeOf(err: unknown): string {
  if (err === null || typeof err !== 'object' || !('code' in err)) return ''
  const code = (err as { code: unknown }).code
  return typeof code === 'string' ? code : ''
}

/** The message for a code, falling back to whatever the caller can offer. */
export function messageForCode(code: string, fallback: string): string {
  return PACKAGE_ERROR_MESSAGES[code] ?? fallback
}
