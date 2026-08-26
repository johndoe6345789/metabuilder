'use client'

import { Button, Chip, TextField, Typography } from '@/m3'
import { SearchSelect } from '@/components/search-select/SearchSelect'
import {
  usePackageRegistry,
  type PackageRef,
  type RegistryPackage,
} from './use-package-registry'
import { usePackageManagerUi } from './use-package-manager-ui'
import { PackageContentsList } from './PackageContentsList'
import s from './PackageManager.module.scss'

const CATEGORIES: RegistryPackage['manifest']['category'][] = [
  'social', 'entertainment', 'productivity', 'gaming', 'ecommerce', 'content', 'other',
]

// A curated set rather than the full 421-icon library (@metabuilder/icons)
// -- enough variety for a package badge without building a searchable icon
// browser just for this.
const ICONS = [
  'deployed_code', 'widgets', 'web', 'chat', 'forum', 'groups',
  'shield', 'bolt', 'star', 'extension', 'dashboard', 'palette',
]

export function PackageManager({ tenant }: { tenant: string }) {
  const reg = usePackageRegistry()
  const ui = usePackageManagerUi()

  const visible = reg.packages.filter(p => p.archived === ui.showArchived)

  const doCreate = () => {
    if (!ui.newName.trim()) return
    reg.create(ui.newName)
    ui.setNewName('')
    ui.setFlash('Package created')
  }
  const saveEdit = (p: RegistryPackage) => {
    reg.update(p.manifest.id, ui.draft)
    ui.cancelEdit()
    ui.setFlash('Saved')
  }
  const doPublish = async (p: RegistryPackage) => {
    const ok = await reg.publish(p.manifest.id, tenant)
    ui.setFlash(ok ? 'Published' : 'Publish failed')
  }

  const addWorkflow = (id: string, item: PackageRef) => {
    const p = reg.packages.find(pkg => pkg.manifest.id === id)
    if (!p || p.workflows.some(w => w.id === item.id)) return
    reg.updateContents(id, { workflows: [...p.workflows, item] })
  }
  const addPageConfig = (id: string, item: PackageRef) => {
    const p = reg.packages.find(pkg => pkg.manifest.id === id)
    if (!p || p.pageConfigs.some(pc => pc.id === item.id)) return
    reg.updateContents(id, { pageConfigs: [...p.pageConfigs, item] })
  }

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <Typography variant="h6">Your Packages</Typography>
        <span className={s.spacer} />
        <TextField
          size="small"
          label="New package name"
          value={ui.newName}
          onChange={e => {
            ui.setNewName(e.target.value)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') doCreate()
          }}
        />
        <Button variant="contained" size="small" onClick={doCreate}>
          + Create
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={() => {
            ui.setShowArchived(!ui.showArchived)
          }}
        >
          {ui.showArchived ? 'Show active' : 'Show archived'}
        </Button>
      </div>

      {ui.flash && <div className={s.flash}>{ui.flash}</div>}
      {visible.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {ui.showArchived
            ? 'No archived packages.'
            : 'No packages yet — create one to bundle routes, component trees and workflows.'}
        </Typography>
      )}

      <div className={s.grid}>
        {visible.map(p => {
          const editing = ui.editingId === p.manifest.id
          return (
            <div key={p.manifest.id} className={s.card}>
              {editing ? (
                <div className={s.editForm}>
                  <TextField
                    size="small"
                    label="Name"
                    value={ui.draft.name}
                    onChange={e => {
                      ui.patchDraft({ name: e.target.value })
                    }}
                  />
                  <TextField
                    size="small"
                    label="Description"
                    value={ui.draft.description}
                    onChange={e => {
                      ui.patchDraft({ description: e.target.value })
                    }}
                  />

                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <div className={s.chips}>
                    {CATEGORIES.map(cat => (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        color={ui.draft.category === cat ? 'primary' : 'default'}
                        variant={ui.draft.category === cat ? 'filled' : 'outlined'}
                        onClick={() => {
                          ui.patchDraft({ category: cat })
                        }}
                      />
                    ))}
                  </div>

                  <Typography variant="caption" color="text.secondary">Icon</Typography>
                  <div className={s.chips}>
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`${s.iconChip} ${ui.draft.icon === icon ? s.iconChipActive : ''}`}
                        onClick={() => {
                          ui.patchDraft({ icon })
                        }}
                      >
                        <span className="material-symbols-rounded">{icon}</span>
                      </button>
                    ))}
                  </div>

                  <div className={s.row}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        saveEdit(p)
                      }}
                    >
                      Save
                    </Button>
                    <Button size="small" variant="text" onClick={ui.cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={s.head}>
                    <span className="material-symbols-rounded">
                      {p.manifest.icon}
                    </span>
                    <div className={s.meta}>
                      <span className={s.name}>{p.manifest.name}</span>
                      <span className={s.ver}>
                        v{p.manifest.version} · {p.manifest.category}
                      </span>
                    </div>
                    <Chip
                      label={p.publishedId != null ? 'Published' : 'Draft'}
                      size="small"
                      color={p.publishedId != null ? 'success' : 'default'}
                    />
                  </div>
                  {p.manifest.description && (
                    <p className={s.desc}>{p.manifest.description}</p>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Package contents
                  </Typography>
                  <SearchSelect
                    tenant={tenant}
                    packageName="core"
                    entity="Workflow"
                    placeholder="Search workflows to add…"
                    getLabel={r => (typeof r.name === 'string' ? r.name : String(r.id))}
                    onSelect={item => {
                      addWorkflow(p.manifest.id, item)
                    }}
                  />
                  <PackageContentsList
                    items={p.workflows}
                    onReorder={(from, to) => {
                      const next = [...p.workflows]
                      const [moved] = next.splice(from, 1)
                      if (moved) next.splice(to, 0, moved)
                      reg.updateContents(p.manifest.id, { workflows: next })
                    }}
                    onRemove={id => {
                      reg.updateContents(p.manifest.id, {
                        workflows: p.workflows.filter(w => w.id !== id),
                      })
                    }}
                  />

                  <SearchSelect
                    tenant={tenant}
                    packageName="access"
                    entity="PageConfig"
                    placeholder="Search pages to add…"
                    getLabel={r => (typeof r.title === 'string' ? r.title : String(r.id))}
                    onSelect={item => {
                      addPageConfig(p.manifest.id, item)
                    }}
                  />
                  <PackageContentsList
                    items={p.pageConfigs}
                    onReorder={(from, to) => {
                      const next = [...p.pageConfigs]
                      const [moved] = next.splice(from, 1)
                      if (moved) next.splice(to, 0, moved)
                      reg.updateContents(p.manifest.id, { pageConfigs: next })
                    }}
                    onRemove={id => {
                      reg.updateContents(p.manifest.id, {
                        pageConfigs: p.pageConfigs.filter(pc => pc.id !== id),
                      })
                    }}
                  />

                  <Chip
                    label={p.themeId != null ? '✓ Includes current theme' : 'Include current theme'}
                    size="small"
                    color={p.themeId != null ? 'primary' : 'default'}
                    variant={p.themeId != null ? 'filled' : 'outlined'}
                    onClick={() => {
                      reg.updateContents(p.manifest.id, {
                        themeId: p.themeId != null ? null : tenant,
                      })
                    }}
                  />

                  <div className={s.actions}>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={reg.publishing === p.manifest.id}
                      onClick={() => {
                        void doPublish(p)
                      }}
                    >
                      {reg.publishing === p.manifest.id ? 'Publishing…' : '⇧ Publish'}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        ui.beginEdit(p.manifest.id, {
                          name: p.manifest.name,
                          description: p.manifest.description,
                          category: p.manifest.category,
                          icon: p.manifest.icon,
                        })
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        reg.setArchived(p.manifest.id, !p.archived)
                      }}
                    >
                      {p.archived ? 'Unarchive' : 'Archive'}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        reg.duplicate(p.manifest.id)
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => {
                        reg.remove(p.manifest.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
