'use client'

import { useState } from 'react'
import { CardDetails } from './CardDetails'
import { COLUMNS } from './plan-data'
import { PlanColumn } from './PlanColumn'
import { PlanHeader } from './PlanHeader'
import { NewCardDialog } from './NewCardDialog'
import type { Status, Task } from './plan-types'
import { usePlanBoard } from './use-plan-board'
import s from './PlanTab.module.scss'

export function PlanTab() {
  const board = usePlanBoard()
  const [dragId, setDragId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const selected = board.tasks.find(task => task.id === selectedId) ?? null

  const dropOnColumn = (status: Status) => {
    if (dragId == null) return
    board.moveTo(dragId, status)
    setDragId(null)
  }

  const dropOnCard = (target: Task) => {
    if (dragId == null || dragId === target.id) return
    board.moveTo(dragId, target.status, target.id)
    setDragId(null)
  }

  return (
    <div className={s.root}>
      <PlanHeader
        count={board.tasks.length}
        onAdd={() => {
          setCreating(true)
        }}
      />
      <div className={`${s.workspace} ${selected != null ? s.workspaceWithDetails : ''}`}>
        <div className={s.board} aria-label="Planning board">
          {COLUMNS.map(column => (
            <PlanColumn
              key={column.status}
              column={column}
              tasks={board.byStatus(column.status)}
              dragId={dragId}
              onDropColumn={dropOnColumn}
              onDropCard={dropOnCard}
              onDragStart={setDragId}
              onDragEnd={() => {
                setDragId(null)
              }}
              onOpen={setSelectedId}
              onRemove={board.remove}
            />
          ))}
        </div>
        {selected != null && (
          <CardDetails
            task={selected}
            onClose={() => {
              setSelectedId(null)
            }}
            onChange={patch => {
              board.update(selected.id, patch)
            }}
          />
        )}
      </div>
      {creating && (
        <NewCardDialog
          open
          onClose={() => {
            setCreating(false)
          }}
          onCreate={input => {
            board.create(input)
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}
