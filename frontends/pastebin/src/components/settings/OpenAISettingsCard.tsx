'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Input, Button, FormLabel, MaterialIcon } from '@metabuilder/components/fakemui';
import { useTranslation } from '@/hooks/useTranslation';
import { AI_PLATFORMS, DEFAULT_PLATFORM_ID, getPlatform } from '@/config/aiPlatforms';
import { getStorageConfig } from '@/lib/storage';
import { getAuthToken } from '@/lib/authToken';
import styles from './settings-card.module.scss';

function baseUrl(): string {
  return (getStorageConfig().dbalUrl ?? '').replace(/\/$/, '');
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function OpenAISettingsCard() {
  const t = useTranslation();
  const s = t.settingsCards.openAI;

  const [platformId, setPlatformId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('ai_platform') || DEFAULT_PLATFORM_ID : DEFAULT_PLATFORM_ID
  );
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem(`ai_key_${platformId}`) || '' : ''
  );
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverKeyStatus, setServerKeyStatus] = useState<'unknown' | 'stored' | 'none'>('unknown');

  const platform = getPlatform(platformId);

  // On mount and when platformId changes, check if server has a stored key
  useEffect(() => {
    const flask = baseUrl();
    const token = getAuthToken();
    if (!flask || !token) {
      setServerKeyStatus('none');
      return;
    }
    setServerKeyStatus('unknown');
    fetch(`${flask}/api/ai/settings`, {
      headers: authHeaders(),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data && data.platformId === platformId && data.hasKey === true) {
          setServerKeyStatus('stored');
        } else {
          setServerKeyStatus('none');
        }
      })
      .catch(() => setServerKeyStatus('none'));
  }, [platformId]);

  const handlePlatformChange = (newId: string) => {
    setPlatformId(newId);
    // Load stored key for the newly selected platform
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem(`ai_key_${newId}`) || '' : '';
    setApiKey(storedKey);
    setSaved(false);
  };

  const handleSave = async () => {
    // Always save to localStorage for backward compat
    localStorage.setItem('ai_platform', platformId);
    if (apiKey.trim()) {
      localStorage.setItem(`ai_key_${platformId}`, apiKey.trim());
    } else {
      localStorage.removeItem(`ai_key_${platformId}`);
    }

    // Also save to server if authenticated
    const flask = baseUrl();
    const token = getAuthToken();
    if (flask && token) {
      try {
        const r = await fetch(`${flask}/api/ai/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify({
            platformId,
            apiKey: apiKey.trim(),
          }),
        });
        if (r.ok) {
          setServerKeyStatus(apiKey.trim() ? 'stored' : 'none');
        } else {
          console.warn('[OpenAISettingsCard] server save failed, localStorage is fallback');
        }
      } catch (e) {
        console.warn('[OpenAISettingsCard] server save error:', e);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = async () => {
    setApiKey('');
    localStorage.removeItem(`ai_key_${platformId}`);

    // Clear on server too
    const flask = baseUrl();
    const token = getAuthToken();
    if (flask && token) {
      try {
        await fetch(`${flask}/api/ai/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify({ platformId, apiKey: '' }),
        });
        setServerKeyStatus('none');
      } catch (e) {
        console.warn('[OpenAISettingsCard] server clear error:', e);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isConfigured = !platform.keyRequired || !!apiKey || serverKeyStatus === 'stored';

  return (
    <Card data-testid="openai-settings-card" role="region" aria-label="AI platform configuration">
      <CardHeader
        title={
          <div className={styles.headerIconRow}>
            <MaterialIcon name="key" className={styles.iconPrimary} size={20} aria-hidden="true" />
            <h3 className={styles.cardTitle}>{s.title}</h3>
          </div>
        }
        subheader={<p className={styles.cardDescription}>{s.description}</p>}
      />
      <CardContent>
        <div className={styles.contentStackSm}>

          {/* Platform selector */}
          <div className={styles.keyFieldWrapper}>
            <FormLabel htmlFor="ai-platform">{s.platformLabel}</FormLabel>
            <select
              id="ai-platform"
              value={platformId}
              onChange={e => handlePlatformChange(e.target.value)}
              className={styles.platformSelect}
              data-testid="ai-platform-select"
              aria-label="Select AI platform"
            >
              {AI_PLATFORMS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Server-stored key indicator */}
          {serverKeyStatus === 'stored' && (
            <div className={styles.keyServerStatus} data-testid="server-key-status" role="status">
              <MaterialIcon name="cloud_done" size={16} aria-hidden="true" />
              {' Key saved on server'}
            </div>
          )}

          {/* API key (hidden for platforms that don't need one) */}
          {platform.keyRequired && (
            <div className={styles.keyFieldWrapper}>
              <FormLabel htmlFor="ai-key">{s.keyLabel}</FormLabel>
              <div className={styles.keyInputRow}>
                <div className={styles.keyInputRelative}>
                  <Input
                    id="ai-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={serverKeyStatus === 'stored' ? '(using server-stored key)' : platform.keyPlaceholder}
                    data-testid="openai-api-key-input"
                    aria-label={`${platform.name} API key`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className={styles.keyToggleBtn}
                    data-testid="toggle-api-key-visibility"
                    aria-label={showKey ? s.hideKey : s.showKey}
                    aria-pressed={showKey}
                  >
                    {showKey ? <MaterialIcon name="visibility_off" size={18} aria-hidden="true" /> : <MaterialIcon name="visibility" size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <p className={styles.keyHint}>
                {s.keyHint}{' '}
                <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className={styles.keyHintLink}>
                  {platform.docsLabel}
                </a>
              </p>
            </div>
          )}

          <div className={styles.actionBtnRow}>
            <Button
              onClick={handleSave}
              data-testid="save-api-key-btn"
              aria-label="Save AI settings"
            >
              {saved ? s.saved : s.saveButton}
            </Button>
            {(apiKey || serverKeyStatus === 'stored') && (
              <Button
                onClick={handleClear}
                variant="outlined"
                data-testid="clear-api-key-btn"
                aria-label="Clear API key"
              >
                {s.clearButton}
              </Button>
            )}
          </div>

          {isConfigured && (
            <div className={styles.keyConfiguredStatus} data-testid="api-key-configured-status" role="status">
              {s.configuredStatus.replace('{platform}', platform.name).replace('{model}', platform.defaultModel)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
