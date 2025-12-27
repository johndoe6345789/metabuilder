import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Database, hashPassword } from '@/lib/database'
import { generateScrambledPassword, simulateEmailSend } from '@/lib/password-utils'
import type { Comment, User } from '@/lib/level-types'

export function useLevel2State(user: User) {
  const [currentUser, setCurrentUser] = useState<User>(user)
  const [users, setUsers] = useState<User[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ bio: user.bio || '', email: user.email })

  useEffect(() => {
    const loadData = async () => {
      const loadedUsers = await Database.getUsers({ scope: 'all' })
      setUsers(loadedUsers)
      const foundUser = loadedUsers.find(u => u.id === user.id)
      if (foundUser) {
        setCurrentUser(foundUser)
        setProfileForm({ bio: foundUser.bio || '', email: foundUser.email })
      }
      const loadedComments = await Database.getComments()
      setComments(loadedComments)
    }
    void loadData()
  }, [user.id])

  const handleProfileSave = async () => {
    await Database.updateUser(user.id, { bio: profileForm.bio, email: profileForm.email })
    setCurrentUser({ ...currentUser, bio: profileForm.bio, email: profileForm.email })
    setEditingProfile(false)
    toast.success('Profile updated successfully')
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      content: newComment,
      createdAt: Date.now(),
    }

    await Database.addComment(comment)
    setComments((current) => [...current, comment])
    setNewComment('')
    toast.success('Comment posted')
  }

  const handleDeleteComment = async (commentId: string) => {
    await Database.deleteComment(commentId)
    setComments((current) => current.filter(c => c.id !== commentId))
    toast.success('Comment deleted')
  }

  const handleRequestPasswordReset = async () => {
    const newPassword = generateScrambledPassword(16)
    const passwordHash = await hashPassword(newPassword)
    await Database.setCredential(currentUser.username, passwordHash)

    const smtpConfig = await Database.getSMTPConfig()
    await simulateEmailSend(
      currentUser.email,
      'Your New MetaBuilder Password',
      `Your password has been reset at your request.\n\nUsername: ${currentUser.username}\nNew Password: ${newPassword}\n\nPlease login with this password and change it from your profile settings if desired.`,
      smtpConfig || undefined
    )

    toast.success('New password sent to your email! Check console (simulated email)')
  }

  return {
    comments,
    currentUser,
    editingProfile,
    newComment,
    profileForm,
    users,
    setEditingProfile,
    setNewComment,
    setProfileForm,
    handleDeleteComment,
    handlePostComment,
    handleProfileSave,
    handleRequestPasswordReset,
  }
}
