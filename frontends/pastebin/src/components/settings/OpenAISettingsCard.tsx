'use client'

import {
  Card,
  CardContent,
  CardHeader,
  Button,
  FormLabel,
  MaterialIcon,
} from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import { AI_PLATFORMS } from '@/config/aiPlatforms'
import { useOpenAISettings } from './hooks/useOpenAISettings'
import { ApiKeyField } from './ApiKeyField'
import styles from './settings-card.module.scss'

export function OpenAISettingsCard() {
  const t = useTranslation()
  const s = t.settingsCards.openAI
  const vm = useOpenAISettings()

  return (
    <Card
      data-testid="openai-settings-card"
      role="region"
      aria-label="AI platform configuration"
    >
      <CardHeader
        title={
          <div className={styles.headerIconRow}>
            <MaterialIcon
              name="key"
              className={styles.iconPrimary}
              size={20}
              aria-hidden="true"
            />
            <h3 className={styles.cardTitle}>{s.title}</h3>
          </div>
        }
        subheader={<p className={styles.cardDescription}>{s.description}</p>}
      />
      <CardContent>
        <div className={styles.contentStackSm}>
          <div className={styles.keyFieldWrapper}>
            <FormLabel htmlFor="ai-platform">{s.platformLabel}</FormLabel>
            <select
              id="ai-platform"
              value={vm.platformId}
              onChange={e => vm.handlePlatformChange(e.target.value)}
              className={styles.platformSelect}
              data-testid="ai-platform-select"
              aria-label="Select AI platform"
            >
              {AI_PLATFORMS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {vm.serverKeyStatus === 'stored' && (
            <div
              className={styles.keyServerStatus}
              data-testid="server-key-status"
              role="status"
            >
              <MaterialIcon name="cloud_done" size={16} aria-hidden="true" />
              {' Key saved on server'}
            </div>
          )}

          {vm.platform.keyRequired && (
            <ApiKeyField
              platform={vm.platform}
              apiKey={vm.apiKey}
              showKey={vm.showKey}
              serverKeyStatus={vm.serverKeyStatus}
              keyLabel={s.keyLabel}
              showLabel={s.showKey}
              hideLabel={s.hideKey}
              hintText={s.keyHint}
              onApiKeyChange={vm.setApiKey}
              onToggleShow={() => vm.setShowKey(!vm.showKey)}
            />
          )}

          <div className={styles.actionBtnRow}>
            <Button
              onClick={vm.handleSave}
              data-testid="save-api-key-btn"
              aria-label="Save AI settings"
            >
              {vm.saved ? s.saved : s.saveButton}
            </Button>
            {(vm.apiKey || vm.serverKeyStatus === 'stored') && (
              <Button
                onClick={vm.handleClear}
                variant="outlined"
                data-testid="clear-api-key-btn"
                aria-label="Clear API key"
              >
                {s.clearButton}
              </Button>
            )}
          </div>

          {vm.isConfigured && (
            <div
              className={styles.keyConfiguredStatus}
              data-testid="api-key-configured-status"
              role="status"
            >
              {s.configuredStatus
                .replace('{platform}', vm.platform.name)
                .replace('{model}', vm.platform.defaultModel)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
