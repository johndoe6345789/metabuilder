'use client'

import { Button, TextField } from '@/m3'
import { useWebchat } from './use-webchat'
import s from './Webchat.module.scss'

/** IRC-style webchat — an installable package for a user's Level-2 space. */
export function Webchat({
  sender = 'you',
  channel = '#general',
}: {
  sender?: string
  channel?: string
}) {
  const chat = useWebchat(sender)

  return (
    <div className={s.root}>
      <div className={s.header}>
        <span className={s.hash}>#</span>
        <span className={s.channel}>{channel.replace(/^#/, '')}</span>
        <span className={s.count}>{chat.messages.length} messages</span>
      </div>

      <div className={s.messages}>
        {chat.messages.map(m => (
          <div
            key={m.id}
            className={`${s.msg} ${m.sender === sender ? s.mine : ''}`}
          >
            <div className={s.avatar}>{m.sender.charAt(0).toUpperCase()}</div>
            <div className={s.bubble}>
              <div className={s.metaRow}>
                <span className={s.sender}>{m.sender}</span>
                <span className={s.time}>
                  {new Date(m.at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className={s.text}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.composer}>
        <TextField
          size="small"
          fullWidth
          placeholder={`Message ${channel}`}
          value={chat.draft}
          onChange={e => {
            chat.setDraft(e.target.value)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') chat.send()
          }}
        />
        <Button variant="contained" size="small" onClick={chat.send}>
          Send
        </Button>
      </div>
    </div>
  )
}
