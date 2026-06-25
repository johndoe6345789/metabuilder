/**
 * Tests for Settings Page
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import SettingsPage from '../page'

describe('SettingsPage', () => {
  it('should render the page container', () => {
    render(<SettingsPage />)
    expect(screen.getByTestId('settings-page')).toBeInTheDocument()
  })

  it('should render the settings header', () => {
    render(<SettingsPage />)
    expect(screen.getByTestId('settings-header')).toBeInTheDocument()
  })

  it('should render the tabs bar', () => {
    render(<SettingsPage />)
    expect(screen.getByTestId('settings-tabs')).toBeInTheDocument()
  })

  it('should render all tab buttons', () => {
    render(<SettingsPage />)
    expect(screen.getByTestId('tab-preferences')).toBeInTheDocument()
    expect(screen.getByTestId('tab-account')).toBeInTheDocument()
    expect(screen.getByTestId('tab-workflows')).toBeInTheDocument()
    expect(screen.getByTestId('tab-database')).toBeInTheDocument()
    expect(screen.getByTestId('tab-danger-zone')).toBeInTheDocument()
  })

  describe('Preferences Tab (default)', () => {
    it('should render preferences card by default', () => {
      render(<SettingsPage />)
      expect(screen.getByTestId('preferences-card')).toBeInTheDocument()
    })

    it('should render theme select', () => {
      render(<SettingsPage />)
      expect(screen.getByTestId('theme-select')).toBeInTheDocument()
    })

    it('should render language select', () => {
      render(<SettingsPage />)
      expect(screen.getByTestId('language-select')).toBeInTheDocument()
    })

    it('should render notifications switch', () => {
      render(<SettingsPage />)
      expect(screen.getByTestId('notifications-switch')).toBeInTheDocument()
    })

    it('should render email-updates switch', () => {
      render(<SettingsPage />)
      expect(screen.getByTestId('email-updates-switch')).toBeInTheDocument()
    })

    it('should change theme selection', () => {
      render(<SettingsPage />)
      const themeSelect = screen.getByTestId('theme-select') as HTMLSelectElement
      fireEvent.change(themeSelect, { target: { value: 'dark' } })
      expect(themeSelect.value).toBe('dark')
    })

    it('should change language selection', () => {
      render(<SettingsPage />)
      const languageSelect = screen.getByTestId('language-select') as HTMLSelectElement
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
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      await waitFor(() => {
        expect(screen.queryByTestId('save-success-alert')).not.toBeInTheDocument()
      })
      jest.useRealTimers()
    })
  })

  describe('Account Tab', () => {
    const clickAccountTab = () => {
      render(<SettingsPage />)
      fireEvent.click(screen.getByTestId('tab-account'))
    }

    it('should show account card after clicking account tab', () => {
      clickAccountTab()
      expect(screen.getByTestId('account-card')).toBeInTheDocument()
    })

    it('should render email input', () => {
      clickAccountTab()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
    })

    it('should render display name input', () => {
      clickAccountTab()
      expect(screen.getByTestId('display-name-input')).toBeInTheDocument()
    })

    it('should render password inputs', () => {
      clickAccountTab()
      expect(screen.getByTestId('current-password-input')).toBeInTheDocument()
      expect(screen.getByTestId('new-password-input')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument()
    })

    it('should render save account button', () => {
      clickAccountTab()
      expect(screen.getByTestId('save-account-btn')).toBeInTheDocument()
    })
  })

  describe('Workflows Tab', () => {
    const clickWorkflowsTab = () => {
      render(<SettingsPage />)
      fireEvent.click(screen.getByTestId('tab-workflows'))
    }

    it('should show workflow card after clicking workflows tab', () => {
      clickWorkflowsTab()
      expect(screen.getByTestId('workflows-card')).toBeInTheDocument()
    })

    it('should render auto-save switch', () => {
      clickWorkflowsTab()
      expect(screen.getByTestId('auto-save-switch')).toBeInTheDocument()
    })

    it('should render default executor select', () => {
      clickWorkflowsTab()
      expect(screen.getByTestId('default-executor-select')).toBeInTheDocument()
    })

    it('should render workflow timeout input', () => {
      clickWorkflowsTab()
      expect(screen.getByTestId('workflow-timeout-input')).toBeInTheDocument()
    })

    it('should toggle auto-save switch', () => {
      clickWorkflowsTab()
      const autoSaveSwitch = screen.getByTestId('auto-save-switch') as HTMLInputElement
      expect(autoSaveSwitch.checked).toBe(true)
      fireEvent.click(autoSaveSwitch)
      expect(autoSaveSwitch.checked).toBe(false)
    })

    it('should change default executor', () => {
      clickWorkflowsTab()
      const executorSelect = screen.getByTestId('default-executor-select') as HTMLSelectElement
      fireEvent.change(executorSelect, { target: { value: 'python' } })
      expect(executorSelect.value).toBe('python')
    })

    it('should update workflow timeout', () => {
      clickWorkflowsTab()
      const timeoutInput = screen.getByTestId('workflow-timeout-input') as HTMLInputElement
      fireEvent.change(timeoutInput, { target: { value: '600' } })
      expect(timeoutInput.value).toBe('600')
    })
  })

  describe('Danger Zone Tab', () => {
    const clickDangerTab = () => {
      render(<SettingsPage />)
      fireEvent.click(screen.getByTestId('tab-danger-zone'))
    }

    it('should show danger zone card after clicking danger zone tab', () => {
      clickDangerTab()
      expect(screen.getByTestId('danger-zone-card')).toBeInTheDocument()
    })

    it('should render delete account button', () => {
      clickDangerTab()
      expect(screen.getByTestId('delete-account-btn')).toBeInTheDocument()
    })

    it('should open delete confirmation dialog when delete is clicked', () => {
      clickDangerTab()
      fireEvent.click(screen.getByTestId('delete-account-btn'))
      expect(screen.getByTestId('delete-account-dialog')).toBeInTheDocument()
      expect(screen.getByText('Delete Account?')).toBeInTheDocument()
    })

    it('should close dialog on cancel', () => {
      clickDangerTab()
      fireEvent.click(screen.getByTestId('delete-account-btn'))
      fireEvent.click(screen.getByTestId('cancel-delete-btn'))
      expect(screen.queryByTestId('delete-account-dialog')).not.toBeInTheDocument()
    })

    it('should close dialog on confirm delete', () => {
      clickDangerTab()
      fireEvent.click(screen.getByTestId('delete-account-btn'))
      fireEvent.click(screen.getByTestId('confirm-delete-btn'))
      expect(screen.queryByTestId('delete-account-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Tab panels accessibility', () => {
    it('should have proper aria-label on tabs', () => {
      render(<SettingsPage />)
      const tabs = screen.getByTestId('settings-tabs')
      expect(tabs).toHaveAttribute('aria-label', 'settings tabs')
    })

    it('should have tabpanel 0 rendered', () => {
      render(<SettingsPage />)
      const tabPanel = screen.getByTestId('settings-tabpanel-0')
      expect(tabPanel).toHaveAttribute('role', 'tabpanel')
    })
  })
})
