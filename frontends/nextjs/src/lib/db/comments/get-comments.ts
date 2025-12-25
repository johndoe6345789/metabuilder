import { prisma } from '../prisma'
import type { Comment } from '../../level-types'

export async function getComments(): Promise<Comment[]> {
  const comments = await prisma.comment.findMany()
  return comments.map((c) => ({
    id: c.id,
    userId: c.userId,
    content: c.content,
    createdAt: Number(c.createdAt),
    updatedAt: c.updatedAt ? Number(c.updatedAt) : undefined,
    parentId: c.parentId || undefined,
  }))
}
