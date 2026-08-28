/**
 * ChannelList — left sidebar: channel list + join-on-click
 */
'use client'

import { Typography, Chip } from '@/m3'
import type { IrcChannel } from './types'
import styles from './ChannelList.module.scss'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface Props {
  channels: IrcChannel[]
  activeChannelId: string | null
  onSelect: (id: string) => void
  userId: string
  tenantId?: string
}

async function joinChannel(
  channelId: string,
  userId: string,
  tenantId: string
): Promise<void> {
  try {
    await fetch(`${DBAL}/v1/${tenantId}/irc/irc_membership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, userId, tenantId }),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    /* offline */
  }
}

export function ChannelList({
  channels,
  activeChannelId,
  onSelect,
  userId,
  tenantId = 'default',
}: Props) {
  function pick(ch: IrcChannel) {
    onSelect(ch.id)
    void joinChannel(ch.id, userId, tenantId)
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Typography variant="overline" className={styles.label}>
          Channels
        </Typography>
      </div>
      <ul className={styles.list}>
        {channels.map(ch => {
          const active = ch.id === activeChannelId
          return (
            <li
              key={ch.id}
              className={`${styles.item} ${active ? styles.active : ''}`}
              onClick={() => {
                pick(ch)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') pick(ch)
              }}
            >
              <span className={styles.hash}>#</span>
              <span className={styles.name}>{ch.name}</span>
              {(ch.memberCount ?? 0) > 0 && (
                <Chip
                  label={ch.memberCount}
                  size="small"
                  className={styles.badge}
                />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
