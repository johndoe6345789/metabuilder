'use client'

import type { HttpMethod } from '../types'
import styles from '../QueryConsole.module.scss'
import cfg from '../data/queryConsole.json'
import { GuiField, type GuiPanelProps } from './GuiField'

export type { GuiPanelProps }

export function GuiPanel({
  method, tenant, pkg, entity, entityId,
  queryParams, body, loading, pathPreview,
  onMethodChange, onTenantChange, onPkgChange,
  onEntityChange, onEntityIdChange,
  onQueryParamsChange, onBodyChange, onExecute,
}: GuiPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.methodGroup}>
        {cfg.methods.map(m => (
          <button
            key={m.value}
            className={[
              styles.methodBtn,
              styles[m.className as keyof typeof styles],
              method === m.value ? styles.methodBtnActive : '',
            ].join(' ')}
            onClick={() => onMethodChange(m.value as HttpMethod)}
            type="button"
          >
            {m.value}
          </button>
        ))}
      </div>

      <div className={styles.formGrid}>
        <GuiField label="Tenant" value={tenant}
          onChange={onTenantChange} placeholder="pastebin" />
        <GuiField label="Package" value={pkg}
          onChange={onPkgChange} placeholder="pastebin" />
        <GuiField label="Entity" value={entity}
          onChange={onEntityChange} placeholder="Snippet" />
        <GuiField label="ID (optional)" value={entityId}
          onChange={onEntityIdChange} placeholder="abc-123" />
        {method === 'GET' && (
          <GuiField
            label="Query Parameters"
            value={queryParams}
            onChange={onQueryParamsChange}
            placeholder="limit=10&offset=0"
            full
          />
        )}
        {(method === 'POST' || method === 'PUT') && (
          <div className={styles.fieldFull}>
            <label className={styles.label}>JSON Body</label>
            <textarea
              className={styles.bodyEditor}
              value={body}
              onChange={e => onBodyChange(e.target.value)}
              placeholder={
                '{\n  "title": "Hello World",\n  "content": "..."\n}'
              }
            />
          </div>
        )}
      </div>

      <div className={styles.executeRow}>
        <button
          className={styles.executeBtn}
          onClick={onExecute}
          disabled={loading || !tenant || !pkg || !entity}
          type="button"
        >
          {loading ? 'Executing...' : 'Execute'}
        </button>
        <span className={styles.pathPreview}>
          {method} {pathPreview}
        </span>
      </div>
    </div>
  )
}
