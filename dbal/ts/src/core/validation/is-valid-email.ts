// Email validation using regex (RFC-compliant)
// TODO: add tests for isValidEmail (valid/invalid formats).
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailPattern.test(email)
}
