'use client'

import { FormControl, FormLabel, Select } from '@/m3'
import { BLANK_TREE, type SavedTree } from '../workbench-derivations'
import s from '../ComponentTreeTab.module.scss'

export interface TreeSelectProps {
  trees: SavedTree[]
  currentValue: string
  onBlank: () => void
  onPick: (path: string) => void
}

/** Which saved component tree this route is currently showing. */
export function TreeSelect({
  trees,
  currentValue,
  onBlank,
  onPick,
}: TreeSelectProps) {
  return (
    <div className={s.treeBar}>
      <FormControl>
        <FormLabel htmlFor="builder-tree">Component tree</FormLabel>
        <Select
          native
          value={currentValue}
          inputProps={{ id: 'builder-tree' }}
          onChange={
            ((event: React.ChangeEvent<HTMLSelectElement>) => {
              const value = event.target.value
              if (value === BLANK_TREE) onBlank()
              else onPick(value)
            }) as never
          }
        >
          <option value={BLANK_TREE}>
            {trees.length > 0 ? 'Blank tree' : 'Blank tree — none saved yet'}
          </option>
          {trees.map(x => (
            <option key={x.path} value={x.path}>
              {x.title} — {x.path}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
