// Email validation using regex with length guard
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 255) {
    return false
  }
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailPattern.test(email)
}
