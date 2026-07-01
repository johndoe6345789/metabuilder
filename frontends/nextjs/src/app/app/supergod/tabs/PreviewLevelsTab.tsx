'use client'

import { useRouter } from 'next/navigation'
import { Typography, Paper, Button } from '@/m3'
import s from './PreviewLevelsTab.module.scss'

const LEVELS = [
  { level: 1, name: 'Public', desc: 'Landing page and public content', path: '/' },
  {
    level: 2,
    name: 'User Area',
    desc: 'User dashboard and profile',
    path: '/app/dashboard',
  },
  {
    level: 3,
    name: 'Admin Panel',
    desc: 'Data management interface',
    path: '/app/admin',
  },
  {
    level: 4,
    name: 'God Panel',
    desc: 'System builder interface',
    path: '/app/god-panel',
  },
]

export function PreviewLevelsTab() {
  const router = useRouter()

  return (
    <div>
      <Typography variant="h6" gutterBottom>Preview Application Levels</Typography>
      <Typography variant="body2" color="text.secondary">
        View how each level appears to different user roles
      </Typography>
      <div className={s.grid}>
        {LEVELS.map(item => (
          <Paper
            key={item.level}
            className={s.card}
            onClick={() => { router.push(item.path) }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Level {item.level}: {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.desc}
            </Typography>
            <Button variant="outlined" size="small" fullWidth>
              Preview
            </Button>
          </Paper>
        ))}
      </div>
    </div>
  )
}
