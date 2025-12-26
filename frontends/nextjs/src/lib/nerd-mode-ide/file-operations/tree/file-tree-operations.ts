import { appendNode } from '../../nodes/modify/append-node'
import { createFileNode } from '../../nodes/create/create-file-node'
import { createFolderNode } from '../../nodes/create/create-folder-node'
import { deleteNode } from '../../nodes/modify/delete-node'
import { findFirstFile } from '../export/find-first-file'
import { findNodeById } from '../../nodes/find-node-by-id'
import { updateNode } from '../../nodes/modify/update-node'

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
