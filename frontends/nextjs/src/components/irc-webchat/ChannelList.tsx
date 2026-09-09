/**
 * ChannelList — left sidebar: channel list + join-on-click
 */
'use client'

import { Typography, Chip } from '@/m3'
import { joinChannel } from './irc-api'
import type { IrcChannel } from './types'
import styles from './ChannelList.module.scss'

interface Props {
  channels: IrcChannel[]
  activeChannelId: string | null
  onSelect: (id: string) => void
  userId: string
  username: string
  /** The community this chat belongs to. It defaulted to the constant
   *  'default', so joining a channel -- when it could have worked at all
   *  -- would have been recorded against a tenant nobody owns. */
  tenantId: string
}

export function ChannelList({
  channels,
  activeChannelId,
  onSelect,
  userId,
  username,
  tenantId,
}: Props) {
  function pick(ch: IrcChannel) {
    onSelect(ch.id)
    // Membership is incidental to reading the channel, so a refusal is
    // not worth interrupting anyone over -- but it goes to the right
    // address now, and irc-api reports whether it landed.
    void joinChannel(tenantId, ch.id, userId, username)
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
