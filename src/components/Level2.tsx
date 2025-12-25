"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, ChatCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Database, hashPassword } from '@/lib/database'
import { generateScrambledPassword, simulateEmailSend } from '@/lib/password-utils'
import { IRCWebchatDeclarative } from './IRCWebchatDeclarative'
import { ProfileCard } from './level2/ProfileCard'
import { CommentsList } from './level2/CommentsList'
import { AppHeader } from './shared/AppHeader'
import type { User as UserType, Comment } from '@/lib/level-types'

interface Level2Props {
  user: UserType
  onLogout: () => void
  onNavigate: (level: number) => void
}

export function Level2({ user, onLogout, onNavigate }: Level2Props) {
  const [currentUser, setCurrentUser] = useState<UserType>(user)
  const [users, setUsers] = useState<UserType[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    bio: user.bio || '',
    email: user.email,
  })

  useEffect(() => {
    const loadData = async () => {
      const loadedUsers = await Database.getUsers()
      setUsers(loadedUsers)
      const foundUser = loadedUsers.find(u => u.id === user.id)
      if (foundUser) {
        setCurrentUser(foundUser)
        setProfileForm({
          bio: foundUser.bio || '',
          email: foundUser.email,
        })
      }
      const loadedComments = await Database.getComments()
      setComments(loadedComments)
    }
    loadData()
  }, [user.id])

  const handleProfileSave = async () => {
    await Database.updateUser(user.id, {
      bio: profileForm.bio,
      email: profileForm.email,
    })
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

  const userComments = comments.filter(c => c.userId === user.id)
  const allComments = comments

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        username={currentUser.username}
        showAvatar={true}
        onNavigateHome={() => onNavigate(1)}
        onLogout={onLogout}
        variant="user"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">User Dashboard</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="profile">
              <User className="mr-2" size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="comments">
              <ChatCircle className="mr-2" size={16} />
              Comments
            </TabsTrigger>
            <TabsTrigger value="chat">
              <ChatCircle className="mr-2" size={16} />
              Webchat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileCard
              user={currentUser}
              editingProfile={editingProfile}
              profileForm={profileForm}
              onEdit={() => setEditingProfile(true)}
              onCancel={() => setEditingProfile(false)}
              onSave={handleProfileSave}
              onFormChange={setProfileForm}
              onRequestPasswordReset={handleRequestPasswordReset}
            />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post a Comment</CardTitle>
                <CardDescription>Share your thoughts with the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  rows={4}
                />
                <Button onClick={handlePostComment}>Post Comment</Button>
              </CardContent>
            </Card>

            <CommentsList
              comments={userComments}
              currentUserId={user.id}
              users={users}
              onDelete={handleDeleteComment}
              variant="my"
            />

            <CommentsList
              comments={allComments}
              currentUserId={user.id}
              users={users}
              onDelete={handleDeleteComment}
              variant="all"
            />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <IRCWebchatDeclarative user={currentUser} channelName="general" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
