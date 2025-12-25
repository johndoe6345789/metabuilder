import { prisma } from '../prisma'
import type { Comment } from '../../level-types'

export async function addComment(comment: Comment): Promise<void> {
  await prisma.comment.create({
    data: {
      id: comment.id,
      userId: comment.userId,
      content: comment.content,
      createdAt: BigInt(comment.createdAt),
      updatedAt: comment.updatedAt ? BigInt(comment.updatedAt) : null,
      parentId: comment.parentId,
    },
  })
}
