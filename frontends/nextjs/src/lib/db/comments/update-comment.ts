import { prisma } from '../prisma'
import type { Comment } from '../../level-types'

export async function updateComment(commentId: string, updates: Partial<Comment>): Promise<void> {
  const data: any = {}
  if (updates.content !== undefined) data.content = updates.content
  if (updates.updatedAt !== undefined) data.updatedAt = BigInt(updates.updatedAt)
  await prisma.comment.update({ where: { id: commentId }, data })
}
