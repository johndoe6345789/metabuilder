'use client'

import { useRouter } from 'next/navigation'
import { Typography, Paper, Button } from '@/m3'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { PREVIEW_LEVELS, previewLevelHref } from './preview-level-links'
import s from './PreviewLevelsTab.module.scss'

export function PreviewLevelsTab() {
  const router = useRouter()
  const auth = useAuthContext()
  const tenant = auth.user?.tenantId

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Preview Application Levels
      </Typography>
      <Typography variant="body2" color="text.secondary">
        View how each level appears to different user roles
      </Typography>
      <div className={s.grid}>
        {PREVIEW_LEVELS.map(item => (
          <Paper
            key={item.level}
            className={s.card}
            onClick={() => {
              router.push(previewLevelHref(tenant, item.level))
            }}
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
