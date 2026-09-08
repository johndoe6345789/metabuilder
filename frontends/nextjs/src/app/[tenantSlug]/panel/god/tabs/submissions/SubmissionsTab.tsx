'use client'

import { Typography } from '@/m3'
import { csvFilename, downloadText } from './download-csv'
import { SubmissionCard } from './SubmissionCard'
import { SubmissionsToolbar } from './SubmissionsToolbar'
import { submissionsCsv } from './submissions-csv'
import { useSubmissions } from './use-submissions'
import s from './SubmissionsTab.module.scss'

/**
 * What visitors sent through the forms on this community's pages.
 *
 * Forms wrote these rows, the backup exported them and a workflow could
 * be triggered by them -- and no screen ever showed one, so a founder
 * with a contact page could not read a single message it collected.
 */
export function SubmissionsTab() {
  const tab = useSubmissions()

  return (
    <div className={s.root}>
      <Typography variant="h6">Messages</Typography>
      <Typography variant="body2" color="text.secondary">
        What people sent through the forms on your pages, newest first.
      </Typography>

      <SubmissionsToolbar
        forms={tab.forms}
        form={tab.form}
        onForm={tab.setForm}
        showHandled={tab.showHandled}
        onShowHandled={tab.setShowHandled}
        waiting={tab.waiting}
        canExport={tab.visible.length > 0}
        onExport={() => {
          downloadText(
            csvFilename(tab.tenant),
            submissionsCsv(tab.visible)
          )
        }}
        onRefresh={tab.refresh}
      />

      {tab.error !== null && (
        <div className={s.error} role="alert">
          {tab.error}
        </div>
      )}
      {tab.markError !== null && (
        <div className={s.error} role="alert">
          {tab.markError}
        </div>
      )}

      {tab.loading ? (
        <Typography variant="body2" color="text.secondary">
          Reading your messages…
        </Typography>
      ) : (
        <div className={s.list}>
          {tab.visible.map(row => (
            <SubmissionCard
              key={row.id}
              submission={row}
              tenant={tab.tenant}
              onMark={(sub, handled) => {
                void tab.mark(sub, handled)
              }}
            />
          ))}
        </div>
      )}

      {!tab.loading && tab.error === null && tab.visible.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {tab.rows.length === 0
            ? 'Nothing yet. When someone fills in a form on one of your ' +
              'pages, it arrives here.'
            : 'Nothing matches that filter.'}
        </Typography>
      )}
    </div>
  )
}
