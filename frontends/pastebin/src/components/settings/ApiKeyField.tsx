import { Input, FormLabel, MaterialIcon } from '@metabuilder/components/m3'
import type { AIPlatform } from '@/config/aiPlatforms'
import styles from './settings-card.module.scss'

interface ApiKeyFieldProps {
  platform: AIPlatform
  apiKey: string
  showKey: boolean
  serverKeyStatus: 'unknown' | 'stored' | 'none'
  keyLabel: string
  showLabel: string
  hideLabel: string
  hintText: string
  onApiKeyChange: (v: string) => void
  onToggleShow: () => void
}

export function ApiKeyField({
  platform,
  apiKey,
  showKey,
  serverKeyStatus,
  keyLabel,
  showLabel,
  hideLabel,
  hintText,
  onApiKeyChange,
  onToggleShow,
}: ApiKeyFieldProps) {
  return (
    <div className={styles.keyFieldWrapper}>
      <FormLabel htmlFor="ai-key">{keyLabel}</FormLabel>
      <div className={styles.keyInputRow}>
        <div className={styles.keyInputRelative}>
          <Input
            id="ai-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => onApiKeyChange(e.target.value)}
            placeholder={
              serverKeyStatus === 'stored'
                ? '(using server-stored key)'
                : platform.keyPlaceholder
            }
            data-testid="openai-api-key-input"
            aria-label={`${platform.name} API key`}
          />
          <button
            type="button"
            onClick={onToggleShow}
            className={styles.keyToggleBtn}
            data-testid="toggle-api-key-visibility"
            aria-label={showKey ? hideLabel : showLabel}
            aria-pressed={showKey}
          >
            <MaterialIcon
              name={showKey ? 'visibility_off' : 'visibility'}
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <p className={styles.keyHint}>
        {hintText}{' '}
        <a
          href={platform.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.keyHintLink}
        >
          {platform.docsLabel}
        </a>
      </p>
    </div>
  )
}
