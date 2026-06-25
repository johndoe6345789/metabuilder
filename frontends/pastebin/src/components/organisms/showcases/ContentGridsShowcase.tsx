import { Card, Button, MaterialIcon } from '@metabuilder/components/m3'
import { useContentGridsView } from './hooks/useContentGridsView'
import { ProjectGridView, ProjectListView } from './ContentGridViews'

export function ContentGridsShowcase() {
  const { viewMode, setViewMode } = useContentGridsView()

  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="content-grids-showcase"
      role="region"
      aria-label="Content grids showcase"
    >
      <div>
        <h2
          style={{
            fontSize: '1.875rem',
            lineHeight: '2.25rem',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Content Grids
        </h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Switchable grid and list views with filtering
        </p>
      </div>

      <Card>
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--mat-sys-outline-variant)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <h3
              style={{
                fontWeight: 600,
                fontSize: '1.125rem',
                lineHeight: '1.75rem',
              }}
            >
              Projects
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant={viewMode === 'grid' ? 'filled' : 'outlined'}
                onClick={() => setViewMode('grid')}
              >
                <MaterialIcon name="grid_view" aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'filled' : 'outlined'}
                onClick={() => setViewMode('list')}
              >
                <MaterialIcon name="list" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? <ProjectGridView /> : <ProjectListView />}
      </Card>
    </section>
  )
}
