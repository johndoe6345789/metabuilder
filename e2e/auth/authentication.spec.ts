import { test, expect, Page } from '@playwright/test'

/**
 * Authentication E2E Tests
 * 
 * These tests demonstrate TDD principles and Playwright best practices:
 * - Page Object Model (POM) pattern
 * - Test fixtures for common setup
 * - Descriptive test names
 * - Proper waiting strategies
 */

/**
 * LoginPage - Page Object Model
 * Encapsulates login page interactions
 */
class LoginPage {
  constructor(private page: Page) {}

  // Locators
  get emailInput() {
    return this.page.locator('input[name="email"], input[type="email"]')
  }

  get passwordInput() {
    return this.page.locator('input[name="password"], input[type="password"]')
  }

  get submitButton() {
    return this.page.locator('button[type="submit"]')
  }

  get errorMessage() {
    return this.page.locator('[role="alert"], .error-message')
  }

  // Actions
  async goto() {
    await this.page.goto('/login')
    await this.page.waitForLoadState('networkidle')
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password)
  }

  async submit() {
    await this.submitButton.click()
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  // Assertions
  async expectLoginFormVisible() {
    await expect(this.emailInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async expectRedirectToDashboard() {
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 })
  }
}

test.describe('Authentication Flow - TDD Examples', () => {
  test.describe('Login Page', () => {
    test('should display login form elements', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.expectLoginFormVisible()
    })

    test('should show error with invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      
      await loginPage.login('invalid@example.com', 'wrongpassword')
      
      // Should display error message
      await loginPage.expectErrorMessage()
    })
  })
})
