'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeClosed, Key } from '@phosphor-icons/react';

export function OpenAISettingsCard() {
  const [apiKey, setApiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || '' : ''));
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      localStorage.removeItem('openai_api_key');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('openai_api_key');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card data-testid="openai-settings-card" role="region" aria-label="OpenAI API configuration">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" weight="duotone" aria-hidden="true" />
          <CardTitle>OpenAI API Settings</CardTitle>
        </div>
        <CardDescription>
          Configure your OpenAI API key for AI-powered error analysis. Your key is stored locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openai-key">OpenAI API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="openai-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
                data-testid="openai-api-key-input"
                aria-label="OpenAI API key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="toggle-api-key-visibility"
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                aria-pressed={showKey}
              >
                {showKey ? <EyeClosed size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            data-testid="save-api-key-btn"
            aria-label="Save OpenAI API key"
          >
            {saved ? 'Saved!' : 'Save API Key'}
          </Button>
          {apiKey && (
            <Button
              onClick={handleClear}
              variant="outline"
              data-testid="clear-api-key-btn"
              aria-label="Clear OpenAI API key"
            >
              Clear
            </Button>
          )}
        </div>

        {apiKey && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md" data-testid="api-key-configured-status" role="status">
            ✓ API key is configured. Error analysis will use OpenAI GPT-4o-mini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
