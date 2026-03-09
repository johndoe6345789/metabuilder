// Settings Components - Main exports
export { SettingsModal, default } from './SettingsModal';

// Section exports
export { AccountSettings } from './sections/AccountSettings';

// NotificationSettings exports
export {
  NotificationSettings,
  InAppNotificationSettings,
  EmailNotificationSettings,
  PushNotificationSettings,
  NotificationHistorySettings,
} from './NotificationSettings';

// SecuritySettings exports
export {
  SecuritySettings,
  PasswordSecuritySettings,
  TwoFactorSettings,
  SessionManagementSettings,
  AccountDeletionSettings,
} from './SecuritySettings';

// CanvasSettings exports
export {
  CanvasSettings,
  GridSettings,
  SnapSettings,
  LayoutSettings,
  ZoomSettings,
  ViewportSettings,
} from './CanvasSettings';

// Accessibility utilities
export { testId, aria } from './accessibility';
