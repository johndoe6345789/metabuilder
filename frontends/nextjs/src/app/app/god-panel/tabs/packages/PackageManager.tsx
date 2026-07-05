'use client'

import { Button, Chip, TextField, Typography } from '@/m3'
import { useInstalledPackages } from '@/hooks/useInstalledPackages'
import { usePackageRegistry, type RegistryPackage } from './use-package-registry'
import { usePackageManagerUi } from './use-package-manager-ui'
import s from './PackageManager.module.scss'

export function PackageManager({ tenant }: { tenant: string }) {
  const reg = usePackageRegistry()
  const ui = usePackageManagerUi()
  const inst = useInstalledPackages(tenant)

  const visible = reg.packages.filter((p) => p.archived === ui.showArchived)

  const doCreate = () => {
    if (!ui.newName.trim()) return
    reg.create(ui.newName)
    ui.setNewName(''); ui.setFlash('Package created')
  }
  const saveEdit = (p: RegistryPackage) => {
    reg.update(p.manifest.id, ui.draft)
    ui.cancelEdit(); ui.setFlash('Saved')
  }
  const toggleInstall = async (p: RegistryPackage) => {
    const rec = inst.installedRecord(p.manifest.id)
    if (rec) await inst.uninstall(rec.id)
    else await inst.install(p.manifest.id)
  }

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <Typography variant="h6">Your Packages</Typography>
        <span className={s.spacer} />
        <TextField size="small" label="New package name" value={ui.newName}
          onChange={(e) => { ui.setNewName(e.target.value) }}
          onKeyDown={(e) => { if (e.key === 'Enter') doCreate() }} />
        <Button variant="contained" size="small" onClick={doCreate}>+ Create</Button>
        <Button variant="text" size="small"
          onClick={() => { ui.setShowArchived(!ui.showArchived) }}>
          {ui.showArchived ? 'Show active' : 'Show archived'}
        </Button>
      </div>

      {ui.flash && <div className={s.flash}>{ui.flash}</div>}
      {visible.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {ui.showArchived ? 'No archived packages.'
            : 'No packages yet — create one to bundle routes, component trees and workflows.'}
        </Typography>
      )}

      <div className={s.grid}>
        {visible.map((p) => {
          const editing = ui.editingId === p.manifest.id
          const installed = inst.isInstalled(p.manifest.id)
          return (
            <div key={p.manifest.id} className={`${s.card} ${installed ? s.on : ''}`}>
              {editing ? (
                <div className={s.editForm}>
                  <TextField size="small" label="Name" value={ui.draft.name}
                    onChange={(e) => { ui.patchDraft({ name: e.target.value }) }} />
                  <TextField size="small" label="Version" value={ui.draft.version}
                    onChange={(e) => { ui.patchDraft({ version: e.target.value }) }} />
                  <TextField size="small" label="Description"
                    value={ui.draft.description}
                    onChange={(e) => { ui.patchDraft({ description: e.target.value }) }} />
                  <div className={s.row}>
                    <Button size="small" variant="contained" onClick={() => { saveEdit(p) }}>Save</Button>
                    <Button size="small" variant="text" onClick={ui.cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={s.head}>
                    <span className="material-symbols-rounded">{p.manifest.icon}</span>
                    <div className={s.meta}>
                      <span className={s.name}>{p.manifest.name}</span>
                      <span className={s.ver}>v{p.manifest.version} · {p.manifest.category}</span>
                    </div>
                    {installed && <Chip label="Installed" size="small" color="success" />}
                  </div>
                  {p.manifest.description && (
                    <p className={s.desc}>{p.manifest.description}</p>
                  )}
                  <div className={s.actions}>
                    <Button size="small" variant={installed ? 'outlined' : 'contained'}
                      onClick={() => { void toggleInstall(p) }}>
                      {installed ? 'Uninstall' : 'Install'}
                    </Button>
                    <Button size="small" variant="text" onClick={() => {
                      ui.beginEdit(p.manifest.id, {
                        name: p.manifest.name, version: p.manifest.version,
                        description: p.manifest.description,
                      })
                    }}>Edit</Button>
                    <Button size="small" variant="text"
                      onClick={() => { reg.setArchived(p.manifest.id, !p.archived) }}>
                      {p.archived ? 'Unarchive' : 'Archive'}
                    </Button>
                    <Button size="small" variant="text"
                      onClick={() => { reg.duplicate(p.manifest.id) }}>Duplicate</Button>
                    <Button size="small" variant="text" color="error"
                      onClick={() => { reg.remove(p.manifest.id) }}>Delete</Button>
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
