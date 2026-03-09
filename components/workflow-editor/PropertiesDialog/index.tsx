/**
 * PropertiesDialog - Node properties editor with I/O preview and AI
 */

'use client';

import React, { useState } from 'react';
import { Button, Dialog, DialogHeader, DialogTitle, DialogContent, DialogActions } from '../../fakemui';
import type { WorkflowNode, NodeType } from '../types';
import { getNodeIcon } from '../icons';
import { InputPreviewPanel } from './InputPreviewPanel';
import { OutputPreviewPanel } from './OutputPreviewPanel';
import { ConfigPanel } from './ConfigPanel';
import { AIAssistPanel } from './AIAssistPanel';
import styles from '../../../scss/atoms/workflow-editor.module.scss';

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z" />
  </svg>
);

export interface PropertiesDialogProps {
  open: boolean;
  onClose: () => void;
  node: WorkflowNode | null;
  nodeType: NodeType | undefined;
  onUpdateConfig: (nodeId: string, config: Record<string, unknown>) => void;
  onUpdateName: (nodeId: string, name: string) => void;
  onDelete: (nodeId: string) => void;
}

export function PropertiesDialog({ open, onClose, node, nodeType, onUpdateConfig, onUpdateName, onDelete }: PropertiesDialogProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'ai'>('config');

  if (!node) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl">
      <DialogHeader>
        <DialogTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: nodeType?.color || '#666', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d={getNodeIcon(nodeType?.icon || 'code')} /></svg>
            </span>
            <input type="text" value={node.name} onChange={(e) => onUpdateName(node.id, e.target.value)}
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid transparent', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', padding: '2px 4px', width: 200 }}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--mat-sys-primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'transparent'} />
            <span style={{ fontSize: '0.75rem', color: 'var(--mat-sys-on-surface-variant)', fontWeight: 400 }}>{nodeType?.category}</span>
          </span>
        </DialogTitle>
      </DialogHeader>

      <DialogContent>
        <div className={styles.propertiesDialogLayout}>
          <InputPreviewPanel node={node} />

          <div className={styles.propertiesPanelCenter}>
            <div className={styles.propertiesTabs}>
              <button className={`${styles.propertiesTab} ${activeTab === 'config' ? styles.propertiesTabActive : ''}`} onClick={() => setActiveTab('config')}>Configuration</button>
              <button className={`${styles.propertiesTab} ${activeTab === 'ai' ? styles.propertiesTabActive : ''}`} onClick={() => setActiveTab('ai')}><SparklesIcon />AI Assist</button>
            </div>
            {activeTab === 'config' ? <ConfigPanel node={node} nodeType={nodeType} onUpdateConfig={onUpdateConfig} /> : <AIAssistPanel />}
          </div>

          <OutputPreviewPanel node={node} />
        </div>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="error" onClick={() => { onDelete(node.id); onClose(); }}>Delete</Button>
        <div style={{ flex: 1 }} />
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
