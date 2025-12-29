import { createFileNode } from '../../nodes/create/create-file-node'
import { createFolderNode } from '../../nodes/create/create-folder-node'
import { findNodeById } from '../../nodes/find-node-by-id'
import { appendNode } from '../../nodes/modify/append-node'
import { deleteNode } from '../../nodes/modify/delete-node'
import { updateNode } from '../../nodes/modify/update-node'
import { findFirstFile } from '../export/find-first-file'

export class FileTreeOperations {
  appendNode = appendNode
  createFileNode = createFileNode
  createFolderNode = createFolderNode
  deleteNode = deleteNode
  findFirstFile = findFirstFile
  findNodeById = findNodeById
  updateNode = updateNode
}

export const fileTreeOperations = new FileTreeOperations()
