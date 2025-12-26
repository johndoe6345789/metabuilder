import { appendNode } from './append-node'
import { createFileNode } from './create-file-node'
import { createFolderNode } from './create-folder-node'
import { deleteNode } from './delete-node'
import { findFirstFile } from './find-first-file'
import { findNodeById } from './find-node-by-id'
import { updateNode } from './update-node'

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
