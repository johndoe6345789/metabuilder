'use client'

import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Tabs, Tab, TabPanel, Typography,
} from '@/m3'
import type { ComponentNode } from './types'
import { COMPONENT_CATALOG } from './component-catalog'
import { PropFieldEditor } from './PropFieldEditor'
import { StylesTab, type StylePair } from './StylesTab'
import s from './ConfigDialog.module.scss'

type Props = {
  node: ComponentNode
  onClose: () => void
  onSave: (
    props: Record<string, unknown>,
    styles: Record<string, string>,
  ) => void
}

function toStylePairs(styles: Record<string, string>): StylePair[] {
  return Object.entries(styles).map(([key, value]) => ({ key, value }))
}

function fromStylePairs(pairs: StylePair[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const { key, value } of pairs) {
    if (key.trim() !== '') result[key.trim()] = value
  }
  return result
}

export function ConfigDialog({ node, onClose, onSave }: Props) {
  const def = COMPONENT_CATALOG.find(d => d.type === node.type)
  const [tab, setTab] = useState(0)
  const [props, setProps] = useState<Record<string, unknown>>(
    { ...node.props },
  )
  const [pairs, setPairs] = useState<StylePair[]>(() =>
    toStylePairs(node.styles),
  )

  function setProp(name: string, value: unknown) {
    setProps(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure {node.type}</DialogTitle>
      <DialogContent className={s.dialogContent}>
        <Tabs value={tab} onChange={(_e, v) => { setTab(v as number) }}>
          <Tab label="Props" />
          <Tab label="Styles" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          {def == null || def.propSchema.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No configurable properties.
            </Typography>
          ) : (
            <div className={s.propList}>
              {def.propSchema.map(field => (
                <div key={field.name} className={s.propRow}>
                  <PropFieldEditor
                    field={field}
                    value={props[field.name]}
                    onChange={setProp}
                  />
                </div>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <StylesTab
            pairs={pairs}
            onAdd={() => { setPairs(p => [...p, { key: '', value: '' }]) }}
            onRemove={idx => {
              setPairs(p => p.filter((_, i) => i !== idx))
            }}
            onUpdate={(idx, field, val) => {
              setPairs(p =>
                p.map((pair, i) =>
                  i === idx ? { ...pair, [field]: val } : pair,
                ),
              )
            }}
          />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => { onSave(props, fromStylePairs(pairs)) }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
