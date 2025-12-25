import { prisma } from '../prisma'
import type { Comment } from '../../level-types'

export async function setComments(comments: Comment[]): Promise<void> {
  await prisma.comment.deleteMany()
  for (const comment of comments) {
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
}
