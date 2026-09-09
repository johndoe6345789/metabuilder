'use client'

import { Button, Paper, Typography } from '@/m3'
import { collectionLabel, countLabel } from './tenant-data-counts'
import { useTenantData } from './use-tenant-data'
import s from '../DatabaseTab.module.scss'

/**
 * What this community actually holds.
 *
 * The tab listed the backends DBAL can run on -- which a founder can
 * neither choose nor change -- and nothing anywhere showed them their own
 * rows.
 */
export function TenantDataCard() {
  const data = useTenantData()

  return (
    <Paper className={s.detail}>
      <div className={s.statusBar}>
        <Typography variant="subtitle2">
          What {data.tenant} holds
        </Typography>
        <Button size="small" variant="outlined" onClick={data.refresh}>
          Refresh
        </Button>
      </div>

      {data.loading ? (
        <Typography variant="body2" color="text.secondary">
          Counting…
        </Typography>
      ) : data.unreadable ? (
        <Typography variant="body2" role="alert">
          Nothing could be read, so this is empty because the data layer
          did not answer — not because the community has nothing in it.
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            {data.total} rows across {data.counts.length} collections.
          </Typography>
          <dl className={s.counts}>
            {data.counts.map(count => (
              <div key={count.key} className={s.countRow}>
                <dt>{collectionLabel(count.key)}</dt>
                <dd>{countLabel(count)}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </Paper>
  )
}
