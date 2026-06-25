/**
 * ConfigPanel - Node configuration form
 */

'use client';

import React from 'react';
import { Divider } from '../../fakemui';
import type { WorkflowNode, NodeType } from '../types';
import styles from '../../../scss/atoms/workflow-editor.module.scss';

interface ConfigPanelProps {
  node: WorkflowNode;
  nodeType: NodeType | undefined;
  onUpdateConfig: (nodeId: string, config: Record<string, unknown>) => void;
}

export function ConfigPanel({ node, nodeType, onUpdateConfig }: ConfigPanelProps) {
  const configs = nodeType ? Object.entries(nodeType.defaultConfig) : [];

  return (
    <div className={styles.propertiesForm}>
      {configs.length > 0 ? (
        configs.map(([key, defaultValue]) => (
          <div key={key} className={styles.propertiesField}>
            <label className={styles.propertiesLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </label>
            {typeof defaultValue === 'boolean' ? (
              <label className={styles.propertiesCheckbox}>
                <input
                  type="checkbox"
                  checked={(node.config[key] as boolean) ?? defaultValue}
                  onChange={(e) => onUpdateConfig(node.id, { ...node.config, [key]: e.target.checked })}
                />
                <span>Enabled</span>
              </label>
            ) : typeof defaultValue === 'string' && defaultValue.includes('\n') ? (
              <textarea
                className={styles.propertiesTextarea}
                value={(node.config[key] as string) ?? defaultValue}
                onChange={(e) => onUpdateConfig(node.id, { ...node.config, [key]: e.target.value })}
                rows={4}
              />
            ) : (
              <input
                type={typeof defaultValue === 'number' ? 'number' : 'text'}
                className={styles.propertiesInput}
                value={(node.config[key] as string) ?? String(defaultValue)}
                onChange={(e) => onUpdateConfig(node.id, { ...node.config, [key]: e.target.value })}
              />
            )}
          </div>
        ))
      ) : (
        <p className={styles.propertiesHint}>This node has no configurable parameters</p>
      )}

      <Divider />

      <div className={styles.propertiesNodeInfo}>
        <div className={styles.propertiesInfoRow}>
          <span>Node ID</span>
          <code>{node.id}</code>
        </div>
        <div className={styles.propertiesInfoRow}>
          <span>Type</span>
          <code>{node.type}</code>
        </div>
        <div className={styles.propertiesInfoRow}>
          <span>Position</span>
          <code>({Math.round(node.position.x)}, {Math.round(node.position.y)})</code>
        </div>
      </div>
    </div>
  );
}
