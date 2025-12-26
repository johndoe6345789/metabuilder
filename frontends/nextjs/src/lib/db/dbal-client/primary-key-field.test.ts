import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetModel = vi.fn()

vi.mock('./get-model', () => ({
  getModel: mockGetModel,
}))

import { getPrimaryKeyField } from './get-primary-key-field'
import { readEntity } from './read-entity'
import { updateEntity } from './update-entity'
import { deleteEntity } from './delete-entity'

describe('getPrimaryKeyField', () => {
  it.each([
    ['Credential', 'username'],
    ['InstalledPackage', 'packageId'],
    ['PackageData', 'packageId'],
    ['PasswordResetToken', 'username'],
    ['SystemConfig', 'key'],
  ])('maps %s to %s', (entity, expected) => {
    expect(getPrimaryKeyField(entity)).toBe(expected)
  })

  it('defaults to id for unknown entities', () => {
    expect(getPrimaryKeyField('User')).toBe('id')
  })
})

describe('dbal-client primary key usage', () => {
  const model = {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }

  beforeEach(() => {
    model.findUnique.mockReset()
    model.update.mockReset()
    model.delete.mockReset()
    mockGetModel.mockReset()
    mockGetModel.mockReturnValue(model)
  })

  it('uses mapped key for readEntity', async () => {
    model.findUnique.mockResolvedValue(null)

    await readEntity('InstalledPackage', 'forum-classic')

    expect(model.findUnique).toHaveBeenCalledWith({
      where: { packageId: 'forum-classic' },
    })
  })

  it('uses mapped key for updateEntity', async () => {
    model.update.mockResolvedValue({ username: 'admin' })

    await updateEntity('Credential', 'admin', { passwordHash: 'hash' })

    expect(model.update).toHaveBeenCalledWith({
      where: { username: 'admin' },
      data: { passwordHash: 'hash' },
    })
  })

  it('uses mapped key for deleteEntity', async () => {
    model.delete.mockResolvedValue({ key: 'theme' })

    await deleteEntity('SystemConfig', 'theme')

    expect(model.delete).toHaveBeenCalledWith({
      where: { key: 'theme' },
    })
  })

  it('falls back to id for standard entities', async () => {
    model.findUnique.mockResolvedValue(null)

    await readEntity('User', 'user_123')

    expect(model.findUnique).toHaveBeenCalledWith({
      where: { id: 'user_123' },
    })
  })
})
