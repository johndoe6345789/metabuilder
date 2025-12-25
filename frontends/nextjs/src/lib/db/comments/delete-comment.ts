import { prisma } from '../prisma'

export async function deleteComment(commentId: string): Promise<void> {
  await prisma.comment.delete({ where: { id: commentId } })
}
