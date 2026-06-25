/**
 * AIAssistPanel - AI-powered configuration assistance
 */

'use client';

import React, { useState } from 'react';
import { Button } from '../../fakemui';
import styles from '../../../scss/atoms/workflow-editor.module.scss';

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
  </svg>
);

interface AIAssistPanelProps {
  onApplySuggestion?: (config: Record<string, unknown>) => void;
}

export function AIAssistPanel({ onApplySuggestion }: AIAssistPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    // Mock AI response - replace with actual API call
    setTimeout(() => {
      setResponse(`Based on "${prompt}":\n\n• Configure transformation logic\n• Add error handling\n• Match downstream format`);
      setLoading(false);
    }, 1500);
  };

  const handleApply = () => {
    onApplySuggestion?.({});
    setResponse(null);
    setPrompt('');
  };

  return (
    <div className={styles.propertiesAiPanel}>
      <p className={styles.propertiesAiIntro}>
        Describe what you want this node to do and AI will help configure it.
      </p>
      <textarea
        className={styles.propertiesAiInput}
        placeholder="e.g., Filter items where price > 100 and category is 'electronics'"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || !prompt.trim()}
        style={{ alignSelf: 'flex-end' }}
      >
        {loading ? 'Thinking...' : <><SparklesIcon /><span style={{ marginLeft: 6 }}>Get Suggestions</span></>}
      </Button>

      {response && (
        <div className={styles.propertiesAiResponse}>
          <div className={styles.propertiesAiResponseHeader}>
            <SparklesIcon /> AI Suggestion
          </div>
          <pre className={styles.propertiesAiResponseContent}>{response}</pre>
          <div className={styles.propertiesAiResponseActions}>
            <Button variant="outlined" onClick={() => setResponse(null)}>Dismiss</Button>
            <Button variant="contained" onClick={handleApply}>Apply</Button>
          </div>
        </div>
      )}
    </div>
  );
}
