import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, ChatCircle, SignOut, House, Trash, Envelope } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Database, hashPassword } from '@/lib/database'
import { generateScrambledPassword, simulateEmailSend } from '@/lib/password-utils'
import { IRCWebchatDeclarative } from './IRCWebchatDeclarative'
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
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
                <span className="font-bold text-xl">MetaBuilder</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate(1)}>
                <House className="mr-2" size={16} />
                Home
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {currentUser.username}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <SignOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your account details</CardDescription>
                  </div>
                  {!editingProfile ? (
                    <Button onClick={() => setEditingProfile(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleProfileSave}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-2xl">
                      {currentUser.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{currentUser.username}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{currentUser.role} Account</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Username</Label>
                    <Input value={currentUser.username} disabled className="mt-2" />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editingProfile ? profileForm.email : currentUser.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      disabled={!editingProfile}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={editingProfile ? profileForm.bio : (currentUser.bio || '')}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      disabled={!editingProfile}
                      className="mt-2"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <Label>Account Created</Label>
                    <Input
                      value={new Date(currentUser.createdAt).toLocaleDateString()}
                      disabled
                      className="mt-2"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Label className="mb-3 block">Security</Label>
                    <Button onClick={handleRequestPasswordReset} variant="outline" className="gap-2">
                      <Envelope size={16} />
                      Request New Password via Email
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      A new randomly generated password will be sent to your email address
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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

            <Card>
              <CardHeader>
                <CardTitle>Your Comments ({userComments.length})</CardTitle>
                <CardDescription>Comments you've posted</CardDescription>
              </CardHeader>
              <CardContent>
                {userComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    You haven't posted any comments yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userComments.map((comment) => (
                      <div key={comment.id} className="border border-border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm flex-1">{comment.content}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Comments ({allComments.length})</CardTitle>
                <CardDescription>Community discussion</CardDescription>
              </CardHeader>
              <CardContent>
                {allComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No comments yet. Be the first to post!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {allComments.map((comment) => {
                      const commentUser = users?.find(u => u.id === comment.userId)
                      return (
                        <div key={comment.id} className="border border-border rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {commentUser?.username[0].toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {commentUser?.username || 'Unknown User'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <IRCWebchatDeclarative user={currentUser} channelName="general" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
