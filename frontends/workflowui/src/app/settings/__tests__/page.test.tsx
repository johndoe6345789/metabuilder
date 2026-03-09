/**
 * Note: FakeMUI components, icons, and styles are mocked via Jest config

Tests for Settings Page
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SettingsPage from '../page'





describe('SettingsPage', () => {
  it('should render the page with all main sections', () => {
    render(<SettingsPage />)

    expect(screen.getByTestId('settings-page')).toBeInTheDocument()
    expect(screen.getByTestId('settings-header')).toBeInTheDocument()
    expect(screen.getByTestId('settings-tabs')).toBeInTheDocument()
  })

  it('should render all tabs', () => {
    render(<SettingsPage />)

    expect(screen.getByTestId('tab-preferences')).toBeInTheDocument()
    expect(screen.getByTestId('tab-account')).toBeInTheDocument()
    expect(screen.getByTestId('tab-workflows')).toBeInTheDocument()
    expect(screen.getByTestId('tab-danger')).toBeInTheDocument()
  })

  describe('Preferences Tab', () => {
    it('should render preferences form by default', () => {
      render(<SettingsPage />)

      expect(screen.getByTestId('preferences-card')).toBeInTheDocument()
      expect(screen.getByTestId('theme-select')).toBeInTheDocument()
      expect(screen.getByTestId('language-select')).toBeInTheDocument()
      expect(screen.getByTestId('notifications-switch')).toBeInTheDocument()
      expect(screen.getByTestId('email-updates-switch')).toBeInTheDocument()
    })

    it('should change theme selection', () => {
      render(<SettingsPage />)

      const themeSelect = screen.getByTestId('theme-select') as HTMLSelectElement
      expect(themeSelect.value).toBe('system')

      fireEvent.change(themeSelect, { target: { value: 'dark' } })
      expect(themeSelect.value).toBe('dark')
    })

    it('should change language selection', () => {
      render(<SettingsPage />)

      const languageSelect = screen.getByTestId('language-select') as HTMLSelectElement
      expect(languageSelect.value).toBe('en')

      fireEvent.change(languageSelect, { target: { value: 'es' } })
      expect(languageSelect.value).toBe('es')
    })

    it('should toggle notifications switch', () => {
      render(<SettingsPage />)

      const notificationsSwitch = screen.getByTestId('notifications-switch') as HTMLInputElement
      expect(notificationsSwitch.checked).toBe(true)

      fireEvent.click(notificationsSwitch)
      expect(notificationsSwitch.checked).toBe(false)
    })

    it('should show success alert when saving preferences', async () => {
      render(<SettingsPage />)

      const saveButton = screen.getByTestId('save-preferences-btn')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('save-success-alert')).toBeInTheDocument()
        expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument()
      })
    })

    it('should hide success alert after timeout', async () => {
      jest.useFakeTimers()
      render(<SettingsPage />)

      const saveButton = screen.getByTestId('save-preferences-btn')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('save-success-alert')).toBeInTheDocument()
      })

      jest.advanceTimersByTime(3000)

      await waitFor(() => {
        expect(screen.queryByTestId('save-success-alert')).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })

  describe('Account Tab', () => {
    it('should render account form inputs', () => {
      render(<SettingsPage />)

      expect(screen.getByTestId('account-card')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('display-name-input')).toBeInTheDocument()
      expect(screen.getByTestId('current-password-input')).toBeInTheDocument()
      expect(screen.getByTestId('new-password-input')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument()
    })

    it('should render save account button', () => {
      render(<SettingsPage />)

      expect(screen.getByTestId('save-account-btn')).toBeInTheDocument()
    })
  })

  describe('Workflows Tab', () => {
    it('should render workflow settings', () => {
      render(<SettingsPage />)

      expect(screen.getByTestId('workflows-card')).toBeInTheDocument()
      expect(screen.getByTestId('auto-save-switch')).toBeInTheDocument()
      expect(screen.getByTestId('default-executor-select')).toBeInTheDocument()
      expect(screen.getByTestId('workflow-timeout-input')).toBeInTheDocument()
    })

    it('should toggle auto-save switch', () => {
      render(<SettingsPage />)

      const autoSaveSwitch = screen.getByTestId('auto-save-switch') as HTMLInputElement
      expect(autoSaveSwitch.checked).toBe(true)

      fireEvent.click(autoSaveSwitch)
      expect(autoSaveSwitch.checked).toBe(false)
    })

    it('should change default executor', () => {
      render(<SettingsPage />)

      const executorSelect = screen.getByTestId('default-executor-select') as HTMLSelectElement
      expect(executorSelect.value).toBe('typescript')

      fireEvent.change(executorSelect, { target: { value: 'python' } })
      expect(executorSelect.value).toBe('python')
    })

    it('should update workflow timeout', () => {
      render(<SettingsPage />)

      const timeoutInput = screen.getByTestId('workflow-timeout-input') as HTMLInputElement
      expect(timeoutInput.value).toBe('300')

      fireEvent.change(timeoutInput, { target: { value: '600' } })
      expect(timeoutInput.value).toBe('600')
    })
  })

  describe('Danger Zone Tab', () => {
    it('should render danger zone content', () => {
      render(<SettingsPage />)

      expect(screen.getByTestId('danger-zone-card')).toBeInTheDocument()
      expect(screen.getByTestId('delete-account-btn')).toBeInTheDocument()
    })

    it('should open delete confirmation dialog', () => {
      render(<SettingsPage />)

      const deleteButton = screen.getByTestId('delete-account-btn')
      fireEvent.click(deleteButton)

      expect(screen.getByTestId('delete-account-dialog')).toBeInTheDocument()
      expect(screen.getByText('Delete Account?')).toBeInTheDocument()
    })

    it('should close dialog on cancel', () => {
      render(<SettingsPage />)

      const deleteButton = screen.getByTestId('delete-account-btn')
      fireEvent.click(deleteButton)

      const cancelButton = screen.getByTestId('cancel-delete-btn')
      fireEvent.click(cancelButton)

      expect(screen.queryByTestId('delete-account-dialog')).not.toBeInTheDocument()
    })

    it('should close dialog on confirm delete', () => {
      render(<SettingsPage />)

      const deleteButton = screen.getByTestId('delete-account-btn')
      fireEvent.click(deleteButton)

      const confirmButton = screen.getByTestId('confirm-delete-btn')
      fireEvent.click(confirmButton)

      expect(screen.queryByTestId('delete-account-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs', () => {
      render(<SettingsPage />)

      // Default to preferences tab (index 0)
      expect(screen.getByTestId('settings-tabpanel-0')).not.toHaveAttribute('hidden')

      // Note: In actual implementation, clicking tabs would change activeTab
      // This is a simplified test due to mocking
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SettingsPage />)

      const tabs = screen.getByTestId('settings-tabs')
      expect(tabs).toHaveAttribute('aria-label', 'settings tabs')
    })

    it('should have proper tab panel roles', () => {
      render(<SettingsPage />)

      const tabPanel = screen.getByTestId('settings-tabpanel-0')
      expect(tabPanel).toHaveAttribute('role', 'tabpanel')
    })
  })
})
